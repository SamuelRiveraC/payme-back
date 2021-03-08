import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class BankAccounts extends BaseSchema {
  protected tableName = 'bank_accounts'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('alias').notNullable()

      table.string('iban').notNullable() //get bank by iban
      table.string('bic').notNullable()

      table.string('primary').notNullable()

      table.float('balance').unsigned()

      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.timestamps(true,true)
      table.timestamp('expires_at', { useTz: true }).nullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}