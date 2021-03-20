import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'
import Transaction from 'App/Models/Transaction'
import BankAccount from 'App/Models/BankAccount'
import Notification from 'App/Models/Notification'

import FetchRefreshToken from 'App/OpenBanking/FetchRefreshToken'
import FetchBankAccounts from 'App/OpenBanking/FetchBankAccounts'
import FetchTransactions from 'App/OpenBanking/FetchTransactions'

import GetToken from "App/OpenBanking/GetToken"
import Database from '@ioc:Adonis/Lucid/Database'

export default class RefreshController {

	public async refreshTokens ({auth}: HttpContextContract) {
		//CHECK IF EXPIRED
		const user = await auth.authenticate()
		let newToken = {}
		let deutschebank = await GetToken(user,"refresh_token","deutschebank")
		let rabobank = await GetToken(user,"refresh_token","rabobank")
		let neonomics = await GetToken(user,"refresh_token","Neonomics")

		// access_token = expires_in: 599 , refresh_token = Permanent?
		if (deutschebank !== undefined && deutschebank !== null) {
			newToken = await FetchRefreshToken(user,deutschebank,"deutschebank") 
			if (!("error" in newToken)) {
				await Database.from('api_tokens')
				  .where('user_id', user.id)
				  .andWhere('name', "deutschebank")
				  .andWhere('type', "auth_token")
				  .delete()

				await auth.use('api').generate(user, {
				  name: "deutschebank", type: "auth_token",
				  token: newToken.access_token, 
				  expiresIn: newToken.expires_in+" seconds"
				})
			}
		}

		// access_token = expires_in: 3600, refresh_token = refresh_token_expires_in : 1 Month
		if (rabobank !== undefined && rabobank !== null) {
			newToken = await FetchRefreshToken(user,rabobank,"rabobank")
			if (!("error" in newToken)) {
				await Database.from('api_tokens').where('user_id', user.id).andWhere('name', "rabobank").delete()
				await auth.use('api').generate(user, {
				  name: "rabobank", type: "auth_token",
				  token: newToken.access_token, 
				  expiresIn: newToken.expires_in+" seconds"
				})
				await auth.use('api').generate(user, {
				  name: "rabobank", type: "refresh_token",
				  token: newToken.refresh_token  , 
				  expiresIn: newToken.refresh_expires_in+" seconds"
				})
			}
		}

		if (neonomics !== undefined && neonomics !== null) {
			newToken = await FetchRefreshToken(user,neonomics,"Neonomics")
			if (!("error" in newToken)) {
				await Database.from('api_tokens').where('user_id', user.id).andWhere('name', "Neonomics").delete()
				await auth.use('api').generate(user, {
				  name: "neonomics", type: "auth_token",
				  token: newToken.access_token, 
				  expiresIn: newToken.expires_in+" seconds"
				})
				await auth.use('api').generate(user, {
				  name: "neonomics", type: "refresh_token",
				  token: newToken.refresh_token  , 
				  expiresIn: newToken.refresh_expires_in+" seconds"
				})
			}
		}
	}




	public async getSelfData ({auth}: HttpContextContract) {
		let user = await auth.authenticate()
		return {...user.serialize()}
	}

	public async fetchNotifications ({auth}: HttpContextContract) {

		let user = await auth.authenticate()
		await user.preload('notifications', (query) => {
			query.where("status",0)
			query.preload('transaction', (query) => {
				query.preload('sender')
				query.preload('receiver')
			})
		})

		const NotificationsSorted = user.notifications.sort(function(a, b) {
  		  return a.status - b.status;
  		}).sort( function(a,b) { 
  		  let c = new Date(a.updated_at);
  		  let d = new Date(b.updated_at);
  		  return d-c; 
  		} )

		return [...NotificationsSorted]
	}

	public async fetchBanks ({auth}: HttpContextContract) {
		let user = await auth.authenticate()
		await user.preload('bankAccounts')

		let primaryAccount = user.bankAccounts.find((account)=> {
		  return account.primary === "true"
		})
		if (primaryAccount !== undefined && primaryAccount.bank !== "payme") {
			let GetBankAccounts = await FetchBankAccounts(user, primaryAccount.bank)

			if(GetBankAccounts.length > 0) {
				for (const [index, account] of GetBankAccounts.entries()) {
					if (primaryAccount.iban === account.iban) {
						await BankAccount.updateOrCreate({iban: account.iban, user_id: user.id}, {
							balance: account.currentBalance,
						})
					}
				}
			}

			await user.preload('bankAccounts')
		}


		return [...user.bankAccounts]
	}



	public async fetchTransactions ({auth}: HttpContextContract) {
		let user = await auth.authenticate()
		await user.preload('bankAccounts')

		let primaryAccount = user.bankAccounts.find((account)=> {
		  return account.primary === "true"
		})
		if (primaryAccount === undefined) {
			return []
		}
		/*
		  I NEED FOR ACCOUNT
		*/  
		await primaryAccount.preload('transactionsSent', (query) => {
		  query.where('status', 1)
		  query.preload('sender')
		  query.preload('receiver')
		})
		await primaryAccount.preload('transactionsReceived', (query) => {
		  query.where('status', 1)
		  query.preload('sender')
		  query.preload('receiver')
		})

		let AllTransactions = []

		if (primaryAccount.transactionsSent === null || primaryAccount.transactionsSent === undefined) {
			AllTransactions	= [...primaryAccount.transactionsSent]
		} else if (primaryAccount.transactionsReceived === null || primaryAccount.transactionsReceived === undefined) {
			AllTransactions = [...primaryAccount.transactionsReceived]
		} else {
			AllTransactions = [...primaryAccount.transactionsSent,...primaryAccount.transactionsReceived]
		}



		let transactionsAPI = []
		if (primaryAccount !== undefined && primaryAccount.bank !== "payme") {
			transactionsAPI = await FetchTransactions(user, primaryAccount)
			AllTransactions = AllTransactions.concat(transactionsAPI)
		}

		AllTransactions = AllTransactions.sort( function(a,b) { 
		  let c = new Date(a.updated_at); let d = new Date(b.updated_at); return d-c; 
		} ).slice(0, 9); 

		return AllTransactions
	}

}
