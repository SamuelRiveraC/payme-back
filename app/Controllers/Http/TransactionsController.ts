import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'
import BankAccount from 'App/Models/BankAccount'
import Transaction from 'App/Models/Transaction'
import Notification from 'App/Models/Notification'

export default class TransactionsController {
  public async store ({auth, request, response}: HttpContextContract) {
    const user = await auth.authenticate()
    let newTransaction = request.all()
    let newNotification = { status: "0"}
    if (user.id == request.input("user_sender_id") || user.id == request.input("user_receiver_id")) {
      return response.status(400).send( {code:"E_SAME_USER"} )
    }
    //IS REQUESTING
    if (request.input("user_sender_id")) {
      const requestedUser = await User.findOrFail(request.input("user_sender_id"))

      newTransaction.user_receiver_id = user.id
      newTransaction.status = "0"
      newNotification.user_id = requestedUser.id
      newNotification.type  = "0"

      const transaction = await Transaction.create(request.all())
      newNotification.transaction_id = transaction.id
      await Notification.create(newNotification)
      await transaction.preload('sender')
      await transaction.preload('receiver')
      return transaction
    }
    //IS SENDING
    else if (request.input("user_receiver_id")) {
      newTransaction.user_sender_id = user.id
      newTransaction.status = "1"
      newNotification.user_id = request.input("user_receiver_id")
      newNotification.type  = "1"

      let senderAccount = await BankAccount.query().where('user_id', user.id).andWhere('primary', "true").first()
      if (senderAccount == null) {
        return response.status(401).send( {code:"E_SENDER_NO_BANK_ACCOUNT"} )
      }
      let receiverAccount = await BankAccount.query().where('user_id', request.input("user_receiver_id")).andWhere('primary', "true").first()
      if (receiverAccount == null) {
        return response.status(401).send( {code:"E_RECEIVER_NO_BANK_ACCOUNT"} )
      }

      if (senderAccount.balance < newTransaction.amount) {
        return response.status(401).send( {code:"E_INSUFFICIENT_FUNDS"} )
      }
      senderAccount.balance = senderAccount.balance - newTransaction.amount
      receiverAccount.balance = receiverAccount.balance + newTransaction.amount



      /**
       * OPEN BANKING - PIS API
      **/
        const transaction = await Transaction.create(request.all())

        await senderAccount.save()
        await receiverAccount.save()

        newNotification.transaction_id = transaction.id
        await Notification.create(newNotification)

        await transaction.preload('sender')
        await transaction.preload('receiver')
        return transaction
      /*
       * OPEN BANKING - PIS API
      **/
    } 
    //BAD REQUEST
    return response.status(400).send( {code:"E_BAD_REQUEST"} )
  }









  
  public async update ({auth, params, response}: HttpContextContract) {
    const transaction = await Transaction.findOrFail(params.id)
    const user = await auth.authenticate()

    if (transaction.status == "1") {
      return response.status(401).send( {code:"E_TRANSACTION_PAID"} )
    } else if (transaction.status == "2") {
      return response.status(401).send( {code:"E_TRANSACTION_CANCELLED"} )
    }


    // TO PAY
    if (user.id == transaction.user_sender_id) {

      let senderAccount = await BankAccount.query().where('user_id', user.id).andWhere('primary', "true").first()
      if (senderAccount == null) {
        return response.status(401).send( {code:"E_SENDER_NO_BANK_ACCOUNT"} )
      }
      let receiverAccount = await BankAccount.query().where('user_id', transaction.user_receiver_id).andWhere('primary', "true").first()
      if (receiverAccount == null) {
        return response.status(401).send( {code:"E_RECEIVER_NO_BANK_ACCOUNT"} )
      }

      if (senderAccount.balance < transaction.amount) {
        return response.status(401).send( {code:"E_INSUFFICIENT_FUNDS"} )
      }
      senderAccount.balance = senderAccount.balance - transaction.amount
      receiverAccount.balance = receiverAccount.balance + transaction.amount
      transaction.status = "1"


      /**
       * OPEN BANKING - PIS API
      **/
        await transaction.save()
        await senderAccount.save()
        await receiverAccount.save()

        //Create Notification for receiver
        await Notification.create({
          user_id: transaction.user_receiver_id,
          transaction_id: transaction.id,
          type:'1',
          status:'0'
        })
        
        // MAKE READ THE SENDER TRANSACTION
        let requesterNotification = await Notification.query().where('transaction_id', transaction.id).andWhere('user_id', transaction.user_sender_id).firstOrFail()
        requesterNotification.status = "1"
        requesterNotification.save()

        await transaction.preload('sender')
        await transaction.preload('receiver')
        return transaction
      /**
       * OPEN BANKING - PIS API
      **/
    } 

    // TO CANCEL
    else if (user.id == transaction.user_receiver_id) {
      transaction.status = "2"
    }

    return response.status(401).send( {code:"E_USER_WRONG_TRANSACTION_ID"} )
  }
}