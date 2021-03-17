import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BankAccount from 'App/Models/BankAccount'

import FetchAuthToken from 'App/OpenBanking/FetchAuthToken'
import FetchAccessToken from 'App/OpenBanking/FetchAccessToken'
import FetchRefreshToken from 'App/OpenBanking/FetchRefreshToken'
import FetchBankAccounts from 'App/OpenBanking/FetchBankAccounts'
import FetchTransactions from 'App/OpenBanking/FetchTransactions'

import GetToken from "App/OpenBanking/GetToken"
import Database from '@ioc:Adonis/Lucid/Database'

export default class OpenBankingController {

  public async OAuthAuth ({auth, request, response}: HttpContextContract) {
    const user = await auth.authenticate()
    const bank = request.input("bank")
    const code = request.input("code")
    
    let AuthToken = await FetchAuthToken(user,bank,code)
    if ("error" in AuthToken) { 
      return response.status(AuthToken.error).send({...AuthToken})
    } else if ("auth_url" in AuthToken){

      return {auth_url: AuthToken.auth_url}

    } else if ("consent_url" in AuthToken){
      
      await auth.use('api').generate(user, {
        name: AuthToken.bank,
        type: "sessionId",
        token: AuthToken.sessionId, 
      })
      return {consent_url: AuthToken.consent_url}

    } else if ("banks" in AuthToken) {

      await auth.use('api').generate(user, {
        name: "Neonomics",
        type: "auth_token",
        token: AuthToken.access_token, 
        expiresIn: AuthToken.expires_in+" seconds"
      })
      await auth.use('api').generate(user, {
        name: "Neonomics",
        type: "refresh_token",
        token: AuthToken.refresh_token  , 
        expiresIn: AuthToken.refresh_expires_in+" seconds"
      })
      return {banks: AuthToken.banks}

    }
  }


  public async urgent ({}: HttpContextContract) {
    let user = {id:1, first_name:"Angela", last_name:"Deutschebank" }
    return user

    //BankAccount => primary bank

    //let BankAccount = {bank:"deutschebank", iban: "DE10010000000000007658"}
    //let t1 = await FetchTransactions(user,BankAccount)
    //BankAccount = {resource_id:"Tkw4MFJBQk8xMTI3MDAwMDAyOkVVUg",bank:"rabobank", iban: "NL80RABO1127000002"}
    //let t2 = await FetchTransactions(user,BankAccount)
    //let BankAccount = {resource_id:"MTIwMzYyMTI1MzM",bank:"DNB", iban: "NO3312036212533"}
    //let t3 = await FetchTransactions(user,BankAccount)
    
    //return t1.concat(["RABOBANK"],t2,["NEONOMICS"],t3);
  }


  public async refreshData ({auth, response}: HttpContextContract) {
    //CHECK IF EXPIRED
    const user = await auth.authenticate()
    let newToken = {}
    let deutschebank = await GetToken(user,"refresh_token","deutschebank")
    let rabobank = await GetToken(user,"refresh_token","rabobank")
    let neonomics = await GetToken(user,"refresh_token","Neonomics")
    console.log(deutschebank,rabobank,neonomics)

    // access_token = expires_in: 599 , refresh_token = Permanent?



    if (deutschebank !== undefined && deutschebank !== null) {
      newToken = await FetchRefreshToken(user,deutschebank,"deutschebank") 
      if (!("error" in newToken)) {
        await Database.from('api_tokens')
          .where('user_id', user.id)
          .andWhere('name', "deutschebank")
          .andWhere('type', "auth_token")
          .delete()

        await auth.use('api').generate(user, {
          name: "deutschebank", type: "auth_token",
          token: newToken.access_token, 
          expiresIn: newToken.expires_in+" seconds"
        })
      }
    }

    // access_token = expires_in: 3600, refresh_token = refresh_token_expires_in : 1 Month
    if (rabobank !== undefined && rabobank !== null) {
      newToken = await FetchRefreshToken(user,rabobank,"rabobank")
      if (!("error" in newToken)) {
        await Database.from('api_tokens').where('user_id', user.id).andWhere('name', "rabobank").delete()
        await auth.use('api').generate(user, {
          name: "rabobank", type: "auth_token",
          token: newToken.access_token, 
          expiresIn: newToken.expires_in+" seconds"
        })
        await auth.use('api').generate(user, {
          name: "rabobank", type: "refresh_token",
          token: newToken.refresh_token  , 
          expiresIn: newToken.refresh_expires_in+" seconds"
        })
      }
    }

    if (neonomics !== undefined && neonomics !== null) {
      newToken = await FetchRefreshToken(user,neonomics,"Neonomics")
      if (!("error" in newToken)) {
        await Database.from('api_tokens').where('user_id', user.id).andWhere('name', "Neonomics").delete()
        await auth.use('api').generate(user, {
          name: "neonomics", type: "auth_token",
          token: newToken.access_token, 
          expiresIn: newToken.expires_in+" seconds"
        })
        await auth.use('api').generate(user, {
          name: "neonomics", type: "refresh_token",
          token: newToken.refresh_token  , 
          expiresIn: newToken.refresh_expires_in+" seconds"
        })
      }
    }

  }

  public async access_token ({auth, request}: HttpContextContract) {
    const user = await auth.authenticate()
    const bank = request.input("bank")
    return await GetToken(user,"auth_token", bank)
  }


  public async OAuthAccessAndBanks ({auth, request, response}: HttpContextContract) {
    const user = await auth.authenticate()
    const bank = request.input("bank")
    const code = request.input("code")
    

      if ((bank == "deutschebank" || bank == "rabobank")) {
        let AccessToken = await FetchAccessToken(user,bank,code)
        await Database.from('api_tokens')
          .where('user_id', user.id)
          .andWhere('name', bank)
          .delete()

        console.log(AccessToken)
        //  access_token, expires_in, refresh_token:, refresh_token_expires_in,

        await auth.use('api').generate(user, {
          name: bank, type: "auth_token",
          token: AccessToken.access_token, 
          expiresIn: AccessToken.expires_in
        })
        await auth.use('api').generate(user, {
          name: bank, type: "refresh_token",
          token: AccessToken.refresh_token, 
          expiresIn: AccessToken.refresh_token_expires_in
        })

        let GetBankAccounts = await FetchBankAccounts(user,bank)

        if ("error" in GetBankAccounts) { 
          return response.status(GetBankAccounts.error).send({...GetBankAccounts})
        } else if ( GetBankAccounts.length > 0) {
          await BankAccount.query().where('user_id', user.id).update({ primary: 'false' })
        } else {
          return response.status(GetBankAccounts.error).send({...GetBankAccounts})
        }

        if (bank === "deutschebank") {
          for (const [index, account] of GetBankAccounts.entries()) {
            await BankAccount.updateOrCreate({iban: account.iban}, {
              user_id: user.id,
              bank: "deutschebank",
              alias: `${account.productDescription} (${user.last_name})`,
              balance: account.currentBalance,
              bic: account.bic, 
              primary: index===0?'true':'false',
            })
          }
        } else if (bank === "rabobank") {
          for (const [index, account] of GetBankAccounts.entries()) {
            await BankAccount.updateOrCreate({iban: account.iban}, {
              user_id: user.id,
              resource_id: account.resourceId,
              bank: "rabobank",
              alias: `${account.ownerName} (${user.last_name})`,
              balance: account.balance.amount, 
              bic: "Update Pending", 
              primary: index===0?'true':'false',
            })
          }
        }

        return GetBankAccounts
      }

      //ELSE: I ASSUME IT WAS CONSENTED NEONOMICS
      
      let GetBankAccounts = await FetchBankAccounts(user,bank)
      console.log("BANK ACCOUNTS:\n",JSON.stringify(GetBankAccounts))
      
      if ("error" in GetBankAccounts) { 
        return response.status(GetBankAccounts.error).send({...GetBankAccounts})
      } else if ( GetBankAccounts.length > 0) {
        await BankAccount.query().where('user_id', user.id).update({ primary: 'false' })
      

        for (const [index, account] of GetBankAccounts.entries()) {
          await BankAccount.updateOrCreate({iban: account.iban}, {
            user_id: user.id,
            resource_id: account.id,
            bank: bank,
            alias: `${account.accountName} (${user.last_name})`,
            balance: account.balances[0].amount < 0 ? account.balances[0].amount*-1 : account.balances[0].amount, //FIX FOR NOW TAKE CARE WITH NEGATIVE NUMBERS IT SEEMS
            bic: "Update pending", 
            primary: index===0?'true':'false',
          })
        }
        return GetBankAccounts
      }
  }


  public async OAuthTransactions ({auth, request, response}: HttpContextContract) {
  }

}