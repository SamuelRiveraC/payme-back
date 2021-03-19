import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Qs from "qs"
import axios from "axios"

import User from 'App/Models/User'
import BankAccount from 'App/Models/BankAccount'
import Transaction from 'App/Models/Transaction'
import Notification from 'App/Models/Notification'

import GetToken from "App/OpenBanking/GetToken"


export default class TransactionsController {
  public async store ({auth, request, response}: HttpContextContract) {
    const user = await auth.authenticate()
    let newTransaction = {}

    newTransaction.amount = request.input("amount")

    let newNotification = { status: "0"}
    if (user.id == request.input("user_sender_id") || user.id == request.input("user_receiver_id")) {
      return response.status(400).send( {code:"E_SAME_USER"} )
    }
    //IS REQUESTING
    if (request.input("user_sender_id")) {
      const requestedUser = await User.findOrFail(request.input("user_sender_id"))
      newTransaction.user_sender_id = requestedUser.id
      newTransaction.user_receiver_id = user.id
      newTransaction.status = "0"
      newNotification.user_id = requestedUser.id
      newNotification.type  = "0"

      const transaction = await Transaction.create(newTransaction)

      newNotification.transaction_id = transaction.id
      await Notification.create(newNotification)
      await transaction.preload('sender')
      await transaction.preload('receiver')
      return transaction
    }
    //IS SENDING
    else if (request.input("user_receiver_id")) {
      newTransaction.user_receiver_id = request.input("user_receiver_id")
      newTransaction.user_sender_id = user.id
      newTransaction.status = "0"
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





      const transaction = await Transaction.create(newTransaction)
      await transaction.preload('sender')
      await transaction.preload('receiver')
      
      let openBanking = {}


      /**
       * OPEN BANKING - PIS API
      **/


        if (request.input("bank") === "payme") {
          openBanking = {status: 200}
        }
        if (request.input("bank") === "deutschebank") {

          let DBToken = await GetToken(user,"auth_token","deutschebank")


          openBanking = await axios.post( "https://simulator-api.db.com/gw/dbapi/paymentInitiation/payments/v1/instantSepaCreditTransfers", 
            {
              "debtorAccount": {
                "iban": senderAccount.iban, "currencyCode": "EUR"
              },
              "instructedAmount": {
                "amount": transaction.amount, "currencyCode": "EUR"
              },
              "creditorName": transaction.receiver.first_name+" "+transaction.receiver.last_name, 
              "creditorAccount": {
                "iban": receiverAccount.iban, "currencyCode": "EUR"
              }
            },
            {
              headers: {
                Authorization: `Bearer ${DBToken}`,
                otp: `${request.input("otp")}`,
                'idempotency-id': transaction.uuid,
              }
            },
            ).then( async (response) => { 
              console.log(response,DBToken)
          console.log(user.id,user.first_name, "auth_token","deutschebank")
              return response
          } ) .catch((error) => {
            console.log(error.response, DBToken); 
          console.log(user.id,user.first_name, "auth_token","deutschebank")
            return error.response})
        }

        //THIS IS CHEATING 


        if (openBanking.status == 200 || openBanking.status == 201) {
          transaction.status = "1"
          await transaction.save()
          await senderAccount.save()
          await receiverAccount.save()
          newNotification.transaction_id = transaction.id
          await Notification.create(newNotification)
          return transaction
        } else {
          return response.status(openBanking.status).send( openBanking )
        }


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
        if (request.input("bank") === "payme") {
          await senderAccount.save()
          await receiverAccount.save()
  
          newNotification.transaction_id = transaction.id
          await Notification.create(newNotification)
  
          await transaction.preload('sender')
          await transaction.preload('receiver')
          return transaction
        }
        if (request.input("bank") === "deutschebank") {

        }

/*************************************************************************/

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