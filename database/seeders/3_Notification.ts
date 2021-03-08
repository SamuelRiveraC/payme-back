import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Notifications from 'App/Models/Notification'

export default class NotificationSeeder extends BaseSeeder {
  public async run () {
    await Notifications.updateOrCreateMany("transaction_id", [
      {
        user_id: '2',
        transaction_id: 1,
        type:'1',
        status:'0'
      },
      {
        user_id: '3',
        transaction_id: 2,
        type:'1',
        status:'0'
      },
      {
        user_id: '4',
        transaction_id: 3,
        type:'1',
        status:'0'
      },
      {
        user_id: '5',
        transaction_id: 4,
        type:'1',
        status:'0'
      },
      {
        user_id: '1',
        transaction_id: 5,
        type:'1',
        status:'0'
      },
      {
        user_id: '2',
        transaction_id: 6,
        type:'1',
        status:'0'
      },
      {
        user_id: '3',
        transaction_id: 7,
        type:'1',
        status:'0'
      },
      {
        user_id: '5',
        transaction_id: 8,
        type:'1',
        status:'0'
      },
      {
        user_id: '2',
        transaction_id: 9,
        type:'1',
        status:'0'
      },
      {
        user_id: '4',
        transaction_id: 10,
        type:'1',
        status:'0'
      },






      {
        user_id: '1',
        transaction_id: 11,
        type:'0',
        status:'0'
      },
      {
        user_id: '1',
        transaction_id: 12,
        type:'0',
        status:'0'
      },
      {
        user_id: '1',
        transaction_id: 13,
        type:'0',
        status:'0'
      },
    ]
  }
}