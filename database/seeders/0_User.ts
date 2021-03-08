import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run () {
    await User.updateOrCreateMany("email",[
      {
        email: 'DuPont@test.com',
        phone: '+320001111',
        password: 'secret',
        first_name: 'Jean',
        last_name: 'DuPont',
        // profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=JP',
        slug: 'DuPont'
      },
      {
      	email: 'Mustermann@gmail.com',
        phone: '+490001111',
        password: 'secret',
        first_name: 'Max',
        last_name: 'Mustermann',
        // profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=MM',
        slug: 'Mustermann'
      },
      {
      	email: 'Jansen@test.com',
        phone: '+310001111',
        password: 'secret',
        first_name: 'Jan',
        last_name: 'Jansen',
        // profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=JJ',
        slug: 'Jansen'
      },
      {
      	email: 'Smith@test.com',
        phone: '+440001111',
        password: 'secret',
        first_name: 'John',
        last_name: 'Smith',
        // profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=JS',
        slug: 'Smith'
      },
      {
        email: 'Ozdemir@test.com',
        phone: '+310002222',
        password: 'secret',
        first_name: 'Suayip',
        last_name: 'Ozdemir',
        // profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=SO',
        slug: 'Ozdemir'
      }
    ])
  }
}
