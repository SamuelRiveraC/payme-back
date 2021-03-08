import Route from '@ioc:Adonis/Core/Route'

Route.resource('bank_accounts', 'BankAccountsController').apiOnly().except(['index'])