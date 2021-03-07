import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Notifications extends BaseSchema {
  protected tableName = 'notifications'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      table.integer('transaction_id').unsigned().references('id').inTable('transactions').onDelete('CASCADE')

      table.integer('type').unsigned()
        // 0 requested money (return link), 1 received money

      table.integer('status').unsigned() 
        // 0 unread, 1 read

      table.timestamps(true,true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
