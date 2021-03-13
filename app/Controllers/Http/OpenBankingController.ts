import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BankAccount from 'App/Models/BankAccount'

import FetchAuthToken from 'App/OpenBanking/FetchAuthToken'
import FetchAccessToken from 'App/OpenBanking/FetchAccessToken'
import FetchBankAccounts from 'App/OpenBanking/FetchBankAccounts'

import GetToken from "App/OpenBanking/GetToken"

export default class OpenBankingController {

  public async OAuthAuth ({auth, request}: HttpContextContract) {
    const user = await auth.authenticate()
    const bank = request.input("bank")
    const code = request.input("code")
    
    // ¿? DO I NEED THIS IF THIS IS THE CASE 
    // The tokens saved inside the database are hashed using sha-256 algorithm.

    let AuthToken = await FetchAuthToken(user,bank,code)

    if ("auth_url" in AuthToken){

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

    } else {
      console.warn("controller else",AuthToken)
      return AuthToken
    }

  }


  public async urgent ({auth}: HttpContextContract) {
    const user = await auth.authenticate()
    const result = await GetToken(user,"access_token","deutschebank")
    return result
  }











  public async OAuthAccessAndBanks ({auth, request}: HttpContextContract) {
    const user = await auth.authenticate()
    const bank = request.input("bank")
    const code = request.input("code")
    

    if ((bank == "deutschebank" || bank == "rabobank")) {
      let AccessToken = await FetchAccessToken(user,bank,code)
    
      await auth.use('api').generate(user, {
        name: bank,
        type: "access_token",
        token: AccessToken.access_token, 
      })
      await auth.use('api').generate(user, {
        name: bank,
        type: "refresh_token",
        token: AccessToken.refresh_token, 
      })

      let GetBankAccounts = await FetchBankAccounts(user,bank)
      if ( GetBankAccounts.length > 0) {
        await BankAccount.query().where('user_id', user.id).update({ primary: 'false' })
      } else {
        return true
      }
      if (bank === "deutschebank") {
        GetBankAccounts.forEach(async (account,index) =>  {
          await BankAccount.updateOrCreate({iban: account.iban}, {
            user_id: user.id,
            bank: "deutschebank",
            alias: `${account.productDescription} (${user.last_name})`,
            balance: account.currentBalance,
            bic: account.bic, 
            primary: index===0?'true':'false',
          })
        });
      }

      else if (bank === "rabobank") {
        //GetBankAccounts.forEach(async (account,index) =>  {
        //  await BankAccount.updateOrCreate({iban: account.iban}, {
        //    user_id: user.id,
        //    bank: "deutschebank"
        //    alias: `${account.productDescription} (${user.last_name})`,
        //    balance: account.currentBalance,
        //    bic: account.bic, 
        //    primary: index===0?'true':'false',
        //  })
        //});
      }

      let StoredBankAccounts = GetBankAccounts //STORE BANK ACCOUNTS
      return StoredBankAccounts
    } 

    //I ASSUME IT WAS CONSENTED NEONOMICS
    
    let GetBankAccounts = await FetchBankAccounts(user,bank)

    if ( GetBankAccounts.length > 0) {
      await BankAccount.query().where('user_id', user.id).update({ primary: 'false' })
      GetBankAccounts.forEach(async (account,index) =>  {
        
        await console.log(GetBankAccounts.length, account.iban)
        
        await BankAccount.updateOrCreate({iban: account.iban}, {
          user_id: user.id,
          bank: bank,
          alias: `${account.accountName} (${user.last_name})`,
          balance: account.balances[0].amount,
          bic: "Update pending", 
          primary: index===0?'true':'false',
        })

      });
      return GetBankAccounts
    }

  }
}
