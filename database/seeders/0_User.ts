import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run () {
    await User.updateOrCreateMany("email",[
      { 
        id:1,
        email: 'Angela@test.com',
        phone: '+100000001',
        password: 'secret',
        first_name: 'Angela',
        last_name: 'Deutschbank',
        profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=AG'
      },
      {
        id:2,
        email: 'Adam@test.com',
        phone: '+100000002',
        password: 'secret',
        first_name: 'Adam',
        last_name: 'Deutschbank',
        profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=AM'
      },
      {
        id:3,
        email: 'Sophie@test.com',
        phone: '+100000003',
        password: 'secret',
        first_name: 'Sophie',
        last_name: 'Rabobank',
        profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=ST'
      },
      {
        id:4,
        email: 'Emma@test.com',
        phone: '+100000005',
        password: 'secret',
        first_name: 'Emma',
        last_name: 'Neonomics',
        profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=JP'
      },
      {
        id:5,
        email: 'Bram@test.com',
        phone: '+100000006',
        password: 'secret',
        first_name: 'Bram',
        last_name: 'Neonomics',
        profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=BT'
      },
      {
        id:6,
        email: 'Ozdemir@test.com',
        phone: '+100000007',
        password: 'secret',
        first_name: 'Suayip',
        last_name: 'Ozdemir',
        profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=SO'
      },
      {
        id:7,
        email: 'Ella@test.com',
        phone: '+100000008',
        password: 'secret',
        first_name: 'Ella',
        last_name: 'PayMe',
        profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=ET'
      },
    ])
  }
}