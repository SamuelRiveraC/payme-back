import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Transaction from 'App/Models/Transaction'
import BankAccount from 'App/Models/BankAccount'

export default class TransactionsController {

	public async show ({auth,request}: HttpContextContract) {
		await auth.authenticate()
   		let transaction = (await Transaction.findOrFail(request.input("transaction")))
   		await transaction.preload('sender', query => query.preload("bankAccounts"))
   		await transaction.preload('receiver', query => query.preload("bankAccounts"))
    	return  transaction
}