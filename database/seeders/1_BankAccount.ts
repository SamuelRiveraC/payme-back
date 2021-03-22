import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import BankAccount from 'App/Models/BankAccount'

export default class BankAccountSeeder extends BaseSeeder {
  public async run () {
    await BankAccount.updateOrCreateMany("iban",[
      {
        id:1,
        user_id: 6,
        bank:"payme",
        alias: "Checking (Ozdemir)",
        balance: "1000"
        iban: 'PM00PAYMETESTACCOUNT1138',
        bic:'DBXXRP01138',
        primary:'true'
      },
      {
        id:2,
        user_id: 7,
        bank:"payme",
        alias: "Checking (Ella)",
        balance: "1000"
        iban: 'PM00PAYMETESTACCOUNT2187',
        bic:'DBXXRP02187',
        primary:'true'
      }
    ])
  }
}
