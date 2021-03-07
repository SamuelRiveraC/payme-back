import Route from '@ioc:Adonis/Core/Route'


Route.resource('users', 'UsersController').apiOnly().except(["index","destroy"])

Route.get('/users/search/:id', 'UsersController.search')
Route.get('/auth', 'UsersController.getSelfData')
Route.post('/login', 'UsersController.login')
Route.get('/logout', 'UsersController.logout')
