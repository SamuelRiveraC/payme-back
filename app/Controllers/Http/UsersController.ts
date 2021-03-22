import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import BankAccount from 'App/Models/BankAccount'
import FetchTransactions from 'App/OpenBanking/FetchTransactions'
import FetchBankAccounts from 'App/OpenBanking/FetchBankAccounts'

export default class UsersController {


  public async search ({auth, params}: HttpContextContract) {
    const user = await auth.authenticate()

    const users = await User.query()
    .where( function (user : User) {
      user.where('email', 'like', `%${params.id}%`)
      .orWhere('phone', 'like', `%${params.id}%`)
      .orWhere('first_name', 'like', `%${params.id}%`)
      .orWhere('last_name', 'like', `%${params.id}%`)
    })
    .andWhereNot('id', user.id)
    .andWhereHas('bankAccounts', (query) => {
      query.where('primary', "true")
    })
    .preload("bankAccounts") 
    return users
  }



  public async store ({request, auth}: HttpContextContract) {
    const savePayload = request.all()
    savePayload.profile_picture = "https://via.placeholder.com/160/29363D/EDF4FC?text="+request.input('first_name')[0]+request.input('last_name')[0]
    const user = await User.create(savePayload)
    const token = await auth.use('api').attempt(request.input('email'), request.input('password'))
    return { ...token.toJSON(), user }
  }





  public async show ({auth, params, response}: HttpContextContract) {
    const user = await User.findByOrFail('slug',params.id)
    const requestUser = await auth.authenticate();
    if (user.id === requestUser.id) {
      return response.status(401).send( {code:"E_ROW_SAME_USER"} )
    }
    return user
  }











  public async update ({request,params}: HttpContextContract) {

    const user = await User.findOrFail(params.id)
    
    if (request.input("first_name"))
      user.first_name = request.input("first_name")
    if (request.input("last_name"))
      user.last_name = request.input("last_name")
    if (request.input("password"))
      user.last_name = request.input("password")
    if (request.input("phone"))
      user.first_name = request.input("phone")
    if (request.input("email"))
      user.last_name = request.input("email")
    
    await user.save()

    return user
  }











  public async login ({ request, auth }: HttpContextContract) {
    const emailOrPhone = request.input('emailOrPhone')
    const password = request.input('password')

    const token = await auth.use('api').attempt(emailOrPhone, password)
    let user  = await User.findOrFail(auth.user.id)

    await user.preload('bankAccounts')
    let primaryAccount = user.bankAccounts.find((account)=> {
      return account.primary === "true"
    })
    if (primaryAccount !== undefined) {
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
    }
    await user.preload('notifications', (query) => {
      query.where("status",0)
      query.preload('transaction', (query) => {
        query.preload('sender')
        query.preload('receiver')
      })
    })  


    return { ...token.toJSON(), user }
  }
  




  public async logout ({ auth }: HttpContextContract) {
    await auth.logout()
  }
}  