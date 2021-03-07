import Route from '@ioc:Adonis/Core/Route'

Route.resource('transactions', 'TransactionsController').apiOnly().except(['index', 'show', 'destroy'])
