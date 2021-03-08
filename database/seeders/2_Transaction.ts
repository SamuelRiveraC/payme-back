import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Transaction from 'App/Models/Transaction'

export default class TransactionSeeder extends BaseSeeder {
  public async run () {

    await Transaction.updateOrCreateMany("id",[
      {
      	id:1,
        user_sender_id: '1',
        user_receiver_id: '2',
        amount:'120',
        status:'1'
      },
      {
      	id:2,
        user_sender_id: '1',
        user_receiver_id: '3',
        amount:'130',
        status:'1'
      },
      {
      	id:3,
        user_sender_id: '1',
        user_receiver_id: '4',
        amount:'140',
        status:'1'
      },
      {
      	id:4,
        user_sender_id: '1',
        user_receiver_id: '5',
        amount:'150',
        status:'1'
      },
      {
      	id:5,
        user_sender_id: '5',
        user_receiver_id: '1',
        amount:'510',
        status:'1'
      },
      {
      	id:6,
        user_sender_id: '5',
        user_receiver_id: '2',
        amount:'520',
        status:'1'
      },
      {
      	id:7,
        user_sender_id: '2',
        user_receiver_id: '3',
        amount:'230',
        status:'1'
      },
      {
      	id:8,
        user_sender_id: '3',
        user_receiver_id: '5',
        amount:'350',
        status:'1'
      },
      {
      	id:9,
        user_sender_id: '5',
        user_receiver_id: '2',
        amount:'520',
        status:'1'
      },
      {
      	id:10,
        user_sender_id: '5',
        user_receiver_id: '4',
        amount:'540',
        status:'1'
      },


      {
      	id:11,
        user_sender_id: '1',
        user_receiver_id: '3',
        amount:'130',
        status:'0'
      },
      {
      	id:12,
        user_sender_id: '1',
        user_receiver_id: '4',
        amount:'140',
        status:'0'
      },
      {
      	id:13,
        user_sender_id: '1',
        user_receiver_id: '5',
        amount:'150',
        status:'0'
      },
    ]
  }
}
