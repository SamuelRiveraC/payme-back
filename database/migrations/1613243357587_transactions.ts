import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Transactions extends BaseSchema {
  protected tableName = 'transactions'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      // table.string('id').unique()

      table.integer('user_sender_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('user_receiver_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      table.float('amount').unsigned()

      table.integer('status').unsigned() 
        // 0 Request, 1 Completed, 2 Failed 3 Canceled

      table.timestamps(true,true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
