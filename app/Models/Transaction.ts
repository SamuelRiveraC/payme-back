import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

import { nanoid } from 'nanoid/async'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_sender_id: number
  
  @column()
  public user_receiver_id: number

  @column()
  public amount: number

  @column()
  public status: string
  
  @belongsTo(() => User, { localKey: 'id', foreignKey: 'user_sender_id' })
  public sender: BelongsTo<typeof User>

  @belongsTo(() => User, { localKey: 'id', foreignKey: 'user_receiver_id' })
  public receiver: BelongsTo<typeof User>

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
