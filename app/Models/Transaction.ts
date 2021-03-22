import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import BankAccount from 'App/Models/BankAccount'
import { v4 as uuid } from 'uuid'
// import { nanoid } from 'nanoid/async'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  public id: string
  
  @column()
  public uuid: string

  @beforeCreate()
  public static async createUUID (model: Transaction) {
    if (!model.$dirty.uuid) {
      model.uuid = uuid()
    }
  }

  @column()
  public user_sender_id: number
  
  @column()
  public user_receiver_id: number
  
  @column()
  public account_sender_id: number
  
  @column()
  public account_receiver_id: number

  @column()
  public amount: number

  @column()
  public status: string
  
  @belongsTo(() => User, { localKey: 'id', foreignKey: 'user_sender_id' })
  public sender: BelongsTo<typeof User>

  @belongsTo(() => User, { localKey: 'id', foreignKey: 'user_receiver_id' })
  public receiver: BelongsTo<typeof User>

  @belongsTo(() => BankAccount, { localKey: 'id', foreignKey: 'account_sender_id' })
  public senderAccount: BelongsTo<typeof BankAccount>

  @belongsTo(() => BankAccount, { localKey: 'id', foreignKey: 'account_receiver_id' })
  public receiverAccount: BelongsTo<typeof BankAccount>


  /*
  @beforeSave()
  public static async id (id: Transaction) {
    if (transaction.$dirty.id) {
      transaction.id = await nanoid(8) 
       // 8  Speed: 1000 IDs per hour -> ~99 days needed to have a 1% probability of collision.
       // 12 Speed: 1000 IDs per hour -> ~1000 years needed to have a 1% probability of collision.
    }
  }
  */

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
