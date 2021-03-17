import Route from '@ioc:Adonis/Core/Route'

Route.resource('users', 'UsersController').apiOnly().except(["index","destroy"])
Route.get('/users/search/:id', 'UsersController.search')

Route.get('/auth', 'UsersController.getSelfData')

Route.post('/login', 'UsersController.login')
Route.get('/logout', 'UsersController.logout')

Route.resource('transactions', 'TransactionsController').apiOnly().except(['index', 'show', 'destroy'])
Route.resource('bank_accounts', 'BankAccountsController').apiOnly().except(['index'])
Route.resource('notifications', 'NotificationsController').apiOnly().only(['update'])

Route.post('/oauth', 'OpenBankingController.OAuthAuth')
Route.post('/oauth-bank', 'OpenBankingController.OAuthAccessAndBanks')
Route.get('/refresh', 'OpenBankingController.refreshData')
Route.get('/oauth-transactions', 'OpenBankingController.OAuthTransactions')
Route.get('/access_token', 'OpenBankingController.access_token')



// TEMPORAL
Route.get('/', 'OpenBankingController.urgent')
