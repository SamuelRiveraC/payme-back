/*

┌──────────────────────────────┬────────────────────────────────┬────────────┐
│ ROUTES                       │ HANDLER                        │ Middleware │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ POST /users                  │ UsersController.store          │ Auth       │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ GET /users/:id               │ UsersController.show           │ Auth       │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ PUT,PATCH /users/:id         │ UsersController.update         │ Auth       │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ GET /users/search/:id        │ UsersController.search         │ Auth       │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ GET /auth                    │ UsersController.getSelfData    │ Auth       │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ POST /login                  │ UsersController.login          │            │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ GET /logout                  │ UsersController.logout         │ Auth       │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ POST /transactions           │ TransactionsController.store   │ Auth       │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ PUT,PATCH /transactions/:id  │ TransactionsController.update  │ Auth       │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ POST /bank_accounts          │ BankAccountsController.store   │ Auth       │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ GET /bank_accounts/:id       │ BankAccountsController.show    │ Auth       │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ PUT,PATCH /bank_accounts/:id │ BankAccountsController.update  │ Auth       │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ DELETE /bank_accounts/:id    │ BankAccountsController.destroy │ Auth       │
├──────────────────────────────┼────────────────────────────────┼────────────┤
│ PUT,PATCH /notifications/:id │ NotificationsController.update │ Auth       │
└──────────────────────────────┴────────────────────────────────┴────────────┘

*/


import Route from '@ioc:Adonis/Core/Route'

Route.resource('users', 'UsersController').apiOnly().except(["index","destroy"])
Route.get('/users/search/:id', 'UsersController.search')
Route.get('/auth', 'UsersController.refreshData')
Route.post('/login', 'UsersController.login')
Route.get('/logout', 'UsersController.logout')

Route.resource('transactions', 'TransactionsController').apiOnly().except(['index', 'show', 'destroy'])
Route.resource('bank_accounts', 'BankAccountsController').apiOnly().except(['index'])
Route.resource('notifications', 'NotificationsController').apiOnly().only(['update'])

Route.post('/oauth', 'OpenBankingController.OAuthAuth')
Route.post('/oauth-bank', 'OpenBankingController.OAuthAccessAndBanks')

Route.get('/access_token', 'OpenBankingController.urgent')
