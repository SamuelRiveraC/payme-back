import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  hasMany, HasMany
} from '@ioc:Adonis/Lucid/Orm'

import Database from '@ioc:Adonis/Lucid/Database'
import BankAccount from 'App/Models/BankAccount'
import Transaction from 'App/Models/Transaction'
import Notification from 'App/Models/Notification'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public phone: string

  @column()
  public first_name: string

  @column()
  public last_name: string

  @column()
  public profile_picture: string

  @column()
  public slug: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @beforeSave()
  public static async Slug (user: User) {
    const total = await Database.query().count('* as total').from('users')
    
    //user.slug = user.email.split('@')[0] + total[0]["total"]
    

    let temptativeSlug = `${user.first_name}-${user.last_name}`.replace(" ","-")
    let check = await User.findBy("slug", temptativeSlug)
    if (!check)
      user.slug = `${user.first_name}-${user.last_name}`
    else
      user.slug = `${user.first_name}-${user.last_name}-${total[0]["total"]}`

  }

  @beforeSave()
  public static async Profile_picture (user: User) {
    const profile_picture = "https://via.placeholder.com/160/29363D/EDF4FC?text="+user.first_name[0]+user.last_name[0]
    if (!user.$dirty.profile_picture) {
      user.profile_picture = profile_picture
    }
  }

  @hasMany(() => BankAccount, { foreignKey: 'user_id', })
  public bankAccounts: HasMany<typeof BankAccount>

  @hasMany(() => Transaction, { foreignKey: 'user_sender_id', })
  public transactionsSent: HasMany<typeof Transaction>

  @hasMany(() => Transaction, { foreignKey: 'user_receiver_id', })
  public transactionsReceived: HasMany<typeof Transaction>

  @hasMany(() => Notification, { foreignKey: 'user_id', })
  public notifications: HasMany<typeof Notification>
}
