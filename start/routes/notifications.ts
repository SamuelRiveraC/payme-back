import Route from '@ioc:Adonis/Core/Route'

Route.resource('notifications', 'NotificationsController').apiOnly().only(['update'])
