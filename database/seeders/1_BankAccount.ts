import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import BankAccount from 'App/Models/BankAccount'

export default class BankAccountSeeder extends BaseSeeder {
  public async run () {
    await BankAccount.updateOrCreateMany("iban",[
      {
        user_id: "1",
        alias: "Checking (DuPont)",
        balance: "1000"
        iban: 'FR0150000000000000000000',
        bic:'DBXX FR 00 000',
        primary:'true'
      },
      {
        user_id: "2",
        alias: "Checking (Mustermann)",
        balance: "1000"
        iban: 'DE0250000000000000000000',
        bic:'DBXX DE 00 000',
        primary:'true'
      },
      {
        user_id: "3",
        alias: "Checking (Jansen)",
        balance: "1000"
        iban: 'NL0350000000000000000000',
        bic:'RBXX NL 00 000',
        primary:'true'
      },
      {
        user_id: "4",
        alias: "Checking (Smith)",
        balance: "1000"
        iban: 'UK0450000000000000000000',
        bic:'RVXX UK 00 000',
        primary:'true'
      },
      {
        user_id: "4",
        alias: "Savings (Smith)",
        balance: "10000"
        iban: 'UK0400000000000000001111',
        bic:'RVXX UK 00 000',
        primary:'false'
      },
      {
        user_id: "5",
        alias: "Checking (Ozdemir)",
        balance: "10000"
        iban: 'NL0150000000000000000000',
        bic:'RBXX NL 00 000',
        primary:'true'
      },
    ])
  }
}
