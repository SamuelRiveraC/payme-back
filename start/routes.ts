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

import './routes/users.ts'
import './routes/transactions.ts'
import './routes/bank_accounts.ts'
import './routes/notifications.ts'