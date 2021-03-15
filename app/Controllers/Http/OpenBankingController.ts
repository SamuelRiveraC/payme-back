import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BankAccount from 'App/Models/BankAccount'

import FetchAuthToken from 'App/OpenBanking/FetchAuthToken'
import FetchAccessToken from 'App/OpenBanking/FetchAccessToken'
import FetchRefreshToken from 'App/OpenBanking/FetchRefreshToken'
import FetchBankAccounts from 'App/OpenBanking/FetchBankAccounts'

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




  public async urgent ({auth}: HttpContextContract) {
    const crypto = require('crypto');
    const iv = crypto.randomBytes(12);
    const ssn = "31125461118"
    const key= Buffer.from(process.env.neonomics_raw_key, 'base64');
    const cipher = crypto.createCipheriv('aes-128-gcm', key, iv, { authTagLength:16 });
    let enc = Buffer.concat([cipher.update(ssn), cipher.final(), cipher.getAuthTag()]);
    const DBN_SSN_ENCRYPTED = Buffer.concat([iv, enc]).toString('base64')

    return DBN_SSN_ENCRYPTED
  }

  public async refreshData ({auth}: HttpContextContract) {
    //CHECK IF EXPIRED

    const user = await auth.authenticate()
    let newToken = {}
    let deleted = {}
    let deutschebank = await GetToken(user,"refresh_token","deutschebank")
    let rabobank = await GetToken(user,"refresh_token","rabobank")
    let neonomics = await GetToken(user,"refresh_token","Neonomics")
    if (deutschebank) {
      newToken = await FetchRefreshToken(user,deutschebank,"deutschebank")
      if (newToken === undefined) { 
          return response.status(500).send({message:"Couldn't fetch refresh tokens"})
      deleted = await Database.from('api_tokens').where('user_id', user.id)
             .andWhere('name', "deutschebank").andWhere('type', "auth_token").delete()
      await auth.use('api').generate(user, {
        name: "deutschebank", type: "auth_token",
        token: newToken.access_token, 
        expiresIn: newToken.expires_in+" seconds"
      })
      // NO REFRESH TOKEN
    }
    if (rabobank) {
      newToken = await FetchRefreshToken(user,rabobank,"rabobank")
      if (newToken === undefined) { 
          return response.status(500).send({message:"Couldn't fetch refresh tokens"})
      deleted = await Database.from('api_tokens').where('user_id', user.id)
             .andWhere('name', "rabobank").delete()
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
    if (neonomics) {
      newToken = await FetchRefreshToken(user,neonomics,"Neonomics")
      if (newToken === undefined) { 
          return response.status(500).send({message:"Couldn't fetch refresh tokens"})
      deleted = await Database.from('api_tokens').where('user_id', user.id)
             .andWhere('name', "Neonomics").delete()
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




  public async OAuthAccessAndBanks ({auth, request, response}: HttpContextContract) {
    const user = await auth.authenticate()
    const bank = request.input("bank")
    const code = request.input("code")
    

      if ((bank == "deutschebank" || bank == "rabobank")) {
        let AccessToken = await FetchAccessToken(user,bank,code)
      
        await auth.use('api').generate(user, {
          name: bank, type: "auth_token",
          token: AccessToken.access_token, 
        })
        await auth.use('api').generate(user, {
          name: bank, type: "refresh_token",
          token: AccessToken.refresh_token, 
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
      console.log("BANK ACCOUNTS:\n",GetBankAccounts)
      
      if ("error" in GetBankAccounts) { 
        return response.status(GetBankAccounts.error).send({...GetBankAccounts})
      } else if ( GetBankAccounts.length > 0) {
        await BankAccount.query().where('user_id', user.id).update({ primary: 'false' })
      

        for (const [index, account] of GetBankAccounts.entries()) {
          await BankAccount.updateOrCreate({iban: account.iban}, {
            user_id: user.id,
            bank: bank,
            alias: `${account.accountName} (${user.last_name})`,
            balance: account.balances[0].amount,
            bic: "Update pending", 
            primary: index===0?'true':'false',
          })
        }
        return GetBankAccounts
      }

    

  }
}
