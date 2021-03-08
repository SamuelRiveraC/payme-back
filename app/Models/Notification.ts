import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

import User from 'App/Models/User'
import Transaction from 'App/Models/Transaction'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: string
  
  @column()
  public status: string

  @column()
  public user_id: number

  @column()
  public transaction_id: number

  @belongsTo(() => User, { localKey: 'id', foreignKey: 'user_id' })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Transaction, { localKey: 'id', foreignKey: 'transaction_id' })
  public transaction: BelongsTo<typeof Transaction>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
