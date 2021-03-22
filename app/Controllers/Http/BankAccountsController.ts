import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import BankAccount from 'App/Models/BankAccount'

export default class BankAccountsController {

  public async store ({auth,request}: HttpContextContract) {
    const user = await auth.authenticate()
    let bank = request.input("bank")
    let bank_accounts = request.input("bank_accounts")

    if (bank === "deutschebank" && bank_accounts.length > 0) {
      await BankAccount.query().where('user_id', user.id).update({ primary: 'false' })
      bank_accounts.forEach(async (account) =>  {
        await BankAccount.updateOrCreate({iban: account.iban}, {
          user_id: user.id,
          alias: `${account.productDescription} (${user.last_name})`,
          balance: account.currentBalance,
          bic: account.bic, 
          primary: 'false',
        })
      });
    }
    if (bank === "rabobank" && bank_accounts.length > 0) {

    }
    if (bank === "payme" ) {
      await BankAccount.query().where('user_id', user.id).update({ primary: 'false' })

      return await BankAccount.create({
        user_id: user.id,
        bank: "payme",
        alias: `PayMe Test Account (${user.last_name})`,
        balance: 1000.00,


        iban: `PM00PAYMETEST${Date.now()}`, // ${(Math.random() * (9999999 - 999999) + 999999).toFixed()} 
        bic: `PM00PM${(Math.random() * (99 - 0) + 0).toFixed()} ${(Math.random() * (999 - 0) + 0).toFixed()}`,
        primary: 'true',
        expires_at: undefined //`${new Date( new Date().getFullYear(), new Date().getMonth() + 3,  new Date().getDate() ).toLocaleString()}`
      })
    }

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
