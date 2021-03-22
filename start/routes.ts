import Route from '@ioc:Adonis/Core/Route'

Route.resource('users', 'UsersController').apiOnly().except(["index","destroy"])
Route.get('/users/search/:id', 'UsersController.search')


Route.post('/login', 'UsersController.login')
Route.get('/logout', 'UsersController.logout')

Route.resource('bank_accounts', 'BankAccountsController').apiOnly().except(['index'])
Route.resource('notifications', 'NotificationsController').apiOnly().only(['update'])

Route.post('/oauth', 'OpenBankingController.OAuthInitiateAuth')
Route.post('/oauth-bank', 'OpenBankingController.OAuthAccessAndBanks')
Route.post('/oauth-transactions', 'OpenBankingController.OAuthTransactions')
Route.post('/oauth-transactions-callback', 'OpenBankingController.OAuthTransactionsCallback')

Route.get('/refresh-tokens', 'RefreshController.refreshTokens')
Route.get('/auth', 'RefreshController.getSelfData')
Route.get('/fetch-notifications', 'RefreshController.fetchNotifications')
Route.get('/fetch-banks', 'RefreshController.fetchBanks')
Route.get('/fetch-transactions', 'RefreshController.fetchTransactions')

// TEMPORAL
Route.get('/', 'OpenBankingController.urgent')
