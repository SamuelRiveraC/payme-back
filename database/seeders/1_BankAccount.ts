import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import BankAccount from 'App/Models/BankAccount'

export default class BankAccountSeeder extends BaseSeeder {
  public async run () {
    await BankAccount.updateOrCreateMany("iban",[
      {
        user_id: 7,
        bank:"payme",
        alias: "Checking (Ozdemir)",
        balance: "1000"
        iban: 'FR0150000000000000000000',
        bic:'DBXX FR 00 000',
        primary:'true'
      },
      {
        user_id: 8,
        bank:"payme",
        alias: "Checking (Ella)",
        balance: "1000"
        iban: 'FR0150000000000000000000',
        bic:'DBXX FR 00 000',
        primary:'true'
      }
    ])
  }
}
