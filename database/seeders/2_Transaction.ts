import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Transaction from 'App/Models/Transaction'

export default class TransactionSeeder extends BaseSeeder {
  public async run () {
    await Transaction.updateOrCreateMany("id",[
      {
      	id:1,
        user_sender_id: 6,
        user_receiver_id: 7,
        account_sender_id: 1,
        account_receiver_id: 2,
        amount:178.1
        status:'1'
      },
      {
      	id:2,
        user_sender_id: 7,
        user_receiver_id: 6,
        account_sender_id: 2,
        account_receiver_id: 1,
        amount:287.2,
        status:'1'
      },
      {
      	id:3,
        user_sender_id: 7,
        user_receiver_id: 6,
        account_sender_id: 2,
        account_receiver_id: 1,
        amount:387.3,
        status:'1'
      },
      {
      	id:4,
        user_sender_id: 6,
        user_receiver_id: 7,
        account_sender_id: 1,
        account_receiver_id: 2,
        amount:478.4,
        status:'1'
      }
    ]
  }
}
