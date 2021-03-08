import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import BankAccount from 'App/Models/BankAccount'

export default class BankAccountsController {

  public async store ({auth}: HttpContextContract) {
    const user = await auth.authenticate()

    /**
     * OPEN BANKING - AIS API
    **/
      const TestAccount = {
        user_id: user.id,
        alias: `PayMe Test Account (${user.last_name})`,
        balance: 1000.00,
        iban: `PMXX ${Date.now()}${(Math.random() * (9999999 - 999999) + 999999).toFixed()}`, 
        bic: `PMXX PM ${(Math.random() * (99 - 0) + 0).toFixed()} ${(Math.random() * (999 - 0) + 0).toFixed()}`,
        primary: 'true',
        expires_at: `${new Date( new Date().getFullYear(), new Date().getMonth() + 3,  new Date().getDate() ).toLocaleString()}`
      }
      await BankAccount.query().where('user_id', user.id).update({ primary: 'false' })
  
      const newAccount = await BankAccount.create(TestAccount)
      return newAccount
    /**
     * OPEN BANKING - AIS API
    **/
  }

  public async show ({auth, params}: HttpContextContract) {
    const user = await auth.authenticate()
    const account = await BankAccount.query().where('id', params.id).andWhere('user_id', user.id).firstOrFail()
    
    /**
     * OPEN BANKING - AIS API - RELOAD BANK BALANCE
    **/

    return account
  }

  public async update ({auth, params, request, response}: HttpContextContract) {

    const user = await auth.authenticate()
    const account = await BankAccount.query().where('id', params.id).andWhere('user_id', user.id).firstOrFail()


    if ( request.input("primary") === "true" || request.input("primary") === "false") {

      if (request.input("primary") === "true") {
        
        //ALL OTHER USER ACCOUNTS = PRIMARY FALSE :D
        await BankAccount.query().where('user_id', user.id).update({ primary: 'false' })
        account.primary = "true"

      } else if (request.input("primary") === "false") {
        account.primary = "false"
      } else {
        return response.status(401).send( {code:"E_BAD_REQUEST"} )
      }
    }

    if (request.input("expires_at")) {

      /**
       * OPEN BANKING - AIS API - RELOAD BANK BALANCE
      **/
        account.expires_at = new Date( new Date().getFullYear(), new Date().getMonth() + 3,  new Date().getDate() ).toLocaleString();
      /**
       * OPEN BANKING - AIS API - RELOAD BANK BALANCE
      **/

    }
    
    await account.save()

    return account
  }

  public async destroy ({auth, params}: HttpContextContract) {
    const user = await auth.authenticate()
    const account = await BankAccount.query().where('id', params.id).andWhere('user_id', user.id).firstOrFail()
    await account.delete()
  } 
}
