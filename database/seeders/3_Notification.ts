import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Notifications from 'App/Models/Notification'

export default class NotificationSeeder extends BaseSeeder {
  public async run () {
    await Notifications.updateOrCreateMany("transaction_id", [
      {
        user_id: 8,
        transaction_id: 1,
        type:'1',
        status:'0'
      },
      {
        user_id: 7,
        transaction_id: 2,
        type:'1',
        status:'0'
      },
      {
        user_id: 7,
        transaction_id: 3,
        type:'1',
        status:'0'
      },
      {
        user_id: 8,
        transaction_id: 4,
        type:'1',
        status:'0'
      },
      //{
      //  user_id: '1',
      //  transaction_id: 11,
      //  type:'0',
      //  status:'0'
      //},
    ]
  }
}