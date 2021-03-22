import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Transaction from 'App/Models/Transaction'

export default class BankAccount extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @column()
  public resource_id: string

  @column()
  public balance: number

  @column()
  public alias: string

  @column()
  public bank: string

  @column()
  public iban: string

  @column()
  public bic: string
	
  @column()
  public primary: string

  @hasMany(() => Transaction, { foreignKey: 'account_sender_id', })
  public transactionsSent: HasMany<typeof Transaction>

  @hasMany(() => Transaction, { foreignKey: 'account_receiver_id', })
  public transactionsReceived: HasMany<typeof Transaction>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ autoCreate: false })
  public expires_at: DateTime
  
}
