import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Transaction from 'App/Models/Transaction'
import BankAccount from 'App/Models/BankAccount'

import FetchAuthToken from 'App/OpenBanking/FetchAuthToken'
import FetchAccessToken from 'App/OpenBanking/FetchAccessToken'
import FetchBankAccounts from 'App/OpenBanking/FetchBankAccounts'

import MakePayment from 'App/OpenBanking/MakePayment'

import GetToken from "App/OpenBanking/GetToken"
import Database from '@ioc:Adonis/Lucid/Database'

import axios from "axios"
import { v4 as uuid } from 'uuid'

import RabobankRequestHeaderTransaction from 'App/OpenBanking/RabobankRequestHeaderTransaction'
import NeonomicsUniqueId from 'App/OpenBanking/NeonomicsUniqueId'
import NeonomicsEncryptSSN from 'App/OpenBanking/NeonomicsEncryptSSN'
import GetIp from 'App/OpenBanking/GetIp'



export default class OpenBankingController {


  public async OAuthInitiateAuth ({auth, request, response}: HttpContextContract) {
    const user = await auth.authenticate()
    const bank = request.input("bank")
    const code = request.input("code")
    
    let AuthToken = await FetchAuthToken(user,bank,code)

    if ("error" in AuthToken) { 
   
      return response.status(AuthToken.error).send({...AuthToken})
   
    } else if ("auth_url" in AuthToken){

      return {auth_url: AuthToken.auth_url}

    } else if ("consent_url" in AuthToken){
      
      console.log("Auth to a Neonomics Bank",{name: AuthToken.bank, type: "sessionId"})
      await auth.use('api').generate(user, {
        name: AuthToken.bank, type: "sessionId", token: AuthToken.sessionId, 
      })
      return {consent_url: AuthToken.consent_url}

    } else if ("banks" in AuthToken) {

      console.log("Auth to Neonomics",{name:"Neonomics",type:"auth_token"})

      await auth.use('api').generate(user, {
        name:"Neonomics",type:"auth_token",token:AuthToken.access_token,expiresIn:AuthToken.expires_in+" seconds"
      })
      await auth.use('api').generate(user, {
        name:"Neonomics",type:"refresh_token",token:AuthToken.refresh_token,expiresIn:AuthToken.refresh_expires_in+" seconds"
      })
      return {banks: AuthToken.banks}

    }
  }



  public async OAuthAccessAndBanks ({auth, request, response}: HttpContextContract) {
    const user = await auth.authenticate()
    const bank = request.input("bank")
    const code = request.input("code")
    

      if ((bank == "deutschebank" || bank == "rabobank")) {
        let AccessToken = await FetchAccessToken(user,bank,code)
        await Database.from('api_tokens')
          .where('user_id', user.id)
          .andWhere('name', bank)
          .delete()

        //  access_token, expires_in, refresh_token:, refresh_token_expires_in,
        await auth.use('api').generate(user, {
          name: bank, type: "auth_token",
          token: AccessToken.access_token, 
          expiresIn: AccessToken.expires_in
        })
        await auth.use('api').generate(user, {
          name: bank, type: "refresh_token",
          token: AccessToken.refresh_token, 
          expiresIn: AccessToken.refresh_token_expires_in
        })

        let GetBankAccounts = await FetchBankAccounts(user,bank)

        if ("error" in GetBankAccounts) { 
          return response.status(GetBankAccounts.error).send({...GetBankAccounts})
        } else if ( GetBankAccounts.length > 0) {
          await BankAccount.query().where('user_id', user.id).update({ primary: 'false' })
        } else {
          return response.status(GetBankAccounts.error).send({...GetBankAccounts})
        }

        if (bank === "deutschebank") {
          for (const [index, account] of GetBankAccounts.entries()) {
            await BankAccount.updateOrCreate({iban: account.iban, user_id: user.id}, {
              bank: "deutschebank",
              alias: `${account.productDescription} (Deutschebank)`,
              balance: account.currentBalance,
              bic: account.bic, 
              primary: index===0?'true':'false',
            })   
          }
        } else if (bank === "rabobank") {
          for (const [index, account] of GetBankAccounts.entries()) {
            await BankAccount.updateOrCreate({iban: account.iban, user_id: user.id}, {
              resource_id: account.resourceId,
              bank: "rabobank",
              alias: `Account (Rabobank)`,
              balance: account.balance.amount, 
              bic: "Update Pending", 
              primary: index===0?'true':'false',
            })
          }
        }

        return GetBankAccounts
      }

      //ELSE: I ASSUME IT WAS CONSENTED NEONOMICS
      
      let GetBankAccounts = await FetchBankAccounts(user,bank)
      
      if ("error" in GetBankAccounts) { 

        return response.status(GetBankAccounts.error).send({...GetBankAccounts})

      } else if ( GetBankAccounts.length > 0) {

        await BankAccount.query().where('user_id', user.id).update({ primary: 'false' })

        for (const [index, account] of GetBankAccounts.entries()) {
          let accountType = ""
          switch (account.accountType) {
            case "CACC": accountType = "Current"; break;
            case "CASH": accountType = "Cash Payments"; break;
            case "SLRY": accountType = "Salary Account"; break;
            case "SVGS": accountType = "Savings"; break;
            default: accountType = "Neonomics Account"; break;
          }
          console.log(account.balances[0].amount)
          await BankAccount.updateOrCreate({iban: account.iban, user_id: user.id}, {
            resource_id: account.id,
            bank: bank,
            alias: `${accountType} (${bank} - ${account.balances[0].currency})`,
            balance: account.balances[0].amount, 
            //FIX FOR NOW TAKE CARE WITH NEGATIVE NUMBERS IT SEEMS
            bic: "Update pending", 
            primary: index===0?'true':'false',
          })
        }
        return GetBankAccounts


      }
  }















  public async OAuthTransactions ({auth, request, response}: HttpContextContract) {
    const transactionType = request.input("type") // Send, Request, User, Payment
    const user = await auth.authenticate()
    let counterParty = {}

    
    let transaction = {
      uuid: uuid().slice(0,32),
      user_receiver_id: 0,
      user_sender_id: 0,
      account_sender_id: 0,
      account_receiver_id: 0,
      amount:  parseFloat((parseFloat(request.input("amount")).toFixed(2))),
      status:  0
    }

    if (transactionType === "Request") {
      counterParty = await User.findOrFail(request.input("counterParty")) 
      transaction.user_sender_id   = counterParty.id
      transaction.user_receiver_id = user.id
      transaction.account_sender_id= null
      transaction.account_receiver_id= null

      return await MakePayment(user, counterParty, transaction, "Request")
    } else if (transactionType == "Payment") {
      transaction = (await Transaction.findOrFail(request.input("transaction"))).serialize()
      counterParty = await User.findOrFail(transaction.user_receiver_id) 
      
      if (transaction.user_sender_id !== user.id)
        return response.status(400).send( {code:"E_NOT_THE_USER_TRANSACTION"} )
      if (transaction.status !== 0)
        return response.status(400).send( {code:"E_ALREADY_PAID"} )
    } else {
      if (transactionType === "User") {
        counterParty = await User.findByOrFail("slug",request.input("counterParty"))
      } else {
        counterParty = await User.findOrFail(request.input("counterParty")) 
      }
      transaction.user_sender_id   = user.id
      transaction.user_receiver_id = counterParty.id
    }

    if (transaction.user_receiver_id === transaction.user_sender_id)
      return response.status(400).send({status:400, code:"E_SAME_USER"} ))

    let senderAccount = await BankAccount.query().where('user_id', user.id).andWhere('primary', "true").first()
    if (senderAccount == null)
      return response.status(400).send({status:401, code:"E_SENDER_NO_BANK_ACCOUNT"})

    let receiverAccount = await BankAccount.query().where('user_id', counterParty.id).andWhere('primary', "true").first()
    if (receiverAccount == null)
      return response.status(400).send({status:401, code:"E_RECEIVER_NO_BANK_ACCOUNT"})

    if (senderAccount.balance < transaction.amount)
      return response.status(400).send({status:401, code:"E_INSUFFICIENT_FUNDS"})
    
    transaction.account_sender_id = senderAccount.id
    transaction.account_receiver_id = receiverAccount.id
    senderAccount.balance = senderAccount.balance - transaction.amount
    receiverAccount.balance = receiverAccount.balance + transaction.amount




    if (senderAccount.bank === "payme") {

      transaction.status = 1 // Since its a test bank it will always be true
      let PMResponse = await MakePayment(user, counterParty, transaction)
      await senderAccount.save()
      await receiverAccount.save()
      return {bank:"payme", ...PMResponse}    
    } else if (senderAccount.bank === "deutschebank") {

      const db_token = await GetToken(user,"auth_token", "deutschebank")
      transaction.amount = transaction.amount + 0.25
      // IF i dont have a OTP request
      if (!request.input("otp_auth_id") && !request.input("otp_auth_key")) {

        let OTPResponse = await axios.post( "https://simulator-api.db.com:443/gw/dbapi/others/onetimepasswords/v2/single", {
            "method": "PHOTOTAN",
            "requestType": "INSTANT_SEPA_CREDIT_TRANSFERS",
            "requestData": {
              type:"challengeRequestDataInstantSepaCreditTransfers",
              targetIban: receiverAccount.iban,
              amountValue: transaction.amount,
              amountCurrency: "EUR",
            }
          }, { headers: { Authorization: `Bearer ${db_token}` }
        }).then( (response) => {
            return {bank: "deutschebank", step:"getOTP",...response.data} //what whas it?
        }).catch((error) => {
            return {bank: "deutschebank", step:"getOTP", ...error.response.data}
        })
        
        if ("code" in OTPResponse || "error" in OTPResponse || OTPResponse === undefined)
          return response.status(500).send( {bank:"deutschebank", code:OTPResponse.message ? OTPResponse.message : "We can't reach Deutschebank Server"} )
        return OTPResponse

      } else {

        let OTPResponse = await axios.patch( "https://simulator-api.db.com:443/gw/dbapi/others/onetimepasswords/v2/single/"+request.input("otp_auth_id"),
          { "response": request.input("otp_auth_key") }, {headers: { Authorization: `Bearer ${db_token}` }
        }).then( (response) => {
          return {bank: "deutschebank", step:"checkOTP", ...response.data} //what whas it?
        })
        .catch((error) => {
          return {bank: "deutschebank", step:"checkOTP", ...error.response.data}
        })

        if ("code" in OTPResponse || OTPResponse === undefined)
          return response.status(500).send( {bank:"deutschebank", code:OTPResponse.message ? OTPResponse.message : "We can't reach Deutschebank Server"} )
        
        let DBResponse = await axios.post( "https://simulator-api.db.com/gw/dbapi/paymentInitiation/payments/v1/instantSepaCreditTransfers", 
            {
              "debtorAccount": {
                "iban": senderAccount.iban, "currencyCode": "EUR"
              },
              "instructedAmount": {
                "amount": transaction.amount, "currencyCode": "EUR"//
              },
              "creditorAccount": {
                "iban": receiverAccount.iban, "currencyCode": "EUR"
              },
              "creditorName": counterParty.first_name+" "+counterParty.last_name, 
            },
            { headers: {
                Authorization: `Bearer ${db_token}`,
                otp: `${OTPResponse.otp}`,
                'idempotency-id': transaction.uuid,
              }
            }).then( async (response) => { 
              return response.data
            }) .catch((error) => {
              return error.response.data
            })

        if ("code" in DBResponse || DBResponse === undefined)
          return response.status(500).send( {bank:"deutschebank", step:"sendTransaction", code:DBResponse.message ? DBResponse.message : "We can't reach Deutschebank Server"} )
        
        if (true) { //#SUAYIP: TRANSACTION TO LOCALHOST SET TO FLASE

          transaction.account_sender_id = null
          transaction.account_receiver_id = receiverAccount.id
          transaction.status=1
          transaction.uuid= DBResponse.paymentId
          let RegisterPayment = await MakePayment(user, counterParty, transaction)
          if ("code" in RegisterPayment)
            return response.status(RegisterPayment.status).send( {bank:"deutschebank", step:"sendTransaction", code:RegisterPayment.code} )
          return {bank:"deutschebank", step:"sendTransaction", ...RegisterPayment}


        } else {

          return {
            bank:"deutschebank", 
            first_name: counterParty.first_name,
            last_name: counterParty.last_name,
            profile_picture: counterParty.profile_picture,
            amount: transaction.amount
          }
        }
      }
    } else if (senderAccount.bank === "rabobank") {

      let transactionBody = {
        "creditorAccount": {
          "currency": "EUR",
          "iban": receiverAccount.iban
        },
        "creditorName": counterParty.first_name+" "+counterParty.last_name,
        "debtorAccount": {
          "currency": "EUR",
          "iban": senderAccount.iban
        },
        "instructedAmount": {
          "content": transaction.amount,
          "currency": "EUR"
        },
      }

      let RB_access_token = await GetToken(user,"auth_token","rabobank") 
      let transactionHeader = await RabobankRequestHeaderTransaction(RB_access_token,JSON.stringify(transactionBody))

      let responseRB = await axios.post( "https://api-sandbox.rabobank.nl/openapi/sandbox/payments/payment-initiation/pis/v1/payments/sepa-credit-transfers",
        transactionBody, transactionHeader
       ).then( (response) => {
        return response 
      }).catch((error) => { 
        return error.response
      })


      if (responseRB.status === 200 || responseRB.status === 201) {
        transaction.status= 1

        let RegisterPayment = await MakePayment(user, counterParty, transaction)

        if ("code" in RegisterPayment)
          return response.status(RegisterPayment.status).send( {bank:"rabobank", step:"sendTransaction", code:RegisterPayment.code} )

        RegisterPayment.url = responseRB.data._links.scaRedirect.href

        await senderAccount.save()
        await receiverAccount.save()
        return {bank:"rabobank", step:"sendTransaction", ...RegisterPayment}

      } else {
        return response.status(responseRB.status).send({bank: "rabobank", code:responseRB.data.tppMessages[0].text})

      }
    } else {

      let neonomicsAuthToken = await GetToken(user,"auth_token","Neonomics") 
      let neonomicsSessionId = await GetToken(user,"sessionId", senderAccount.bank) 

      console.log("STARTING THE TRANSFER", await GetIp(), await NeonomicsUniqueId(user), neonomicsSessionId)

      if (senderAccount.bank === "Sbanken" || senderAccount.bank === "Hizonti Bank" || senderAccount.bank === "Justo Bank") {
        
        transaction.status = '1'
        console.log(senderAccount.bank, "NO VALIDATION")
        let NeonomicsPayment = await MakePayment(user, counterParty, transaction)
        await senderAccount.save()
        await receiverAccount.save()
        return {...NeonomicsPayment}
      }



      let NeonomicsTransfer = await axios.post( "https://sandbox.neonomics.io/ics/v3/payments/sepa-credit", 
      //let NeonomicsTransfer = await axios.post( "https://sandbox.neonomics.io/ics/v3/payments/domestic-transfer", 
        {
          "creditorAccount": {
            "iban": receiverAccount.iban
          },
          "debtorAccount": {
            "iban": senderAccount.iban
          },
          "debtorName": `${user.first_name} ${user.last_name}`,
          "creditorName": `${counterParty.first_name} ${counterParty.last_name}`,
          "remittanceInformationUnstructured": transaction.uuid,
          "instrumentedAmount": transaction.amount,
          "currency": "EUR",
          "endToEndIdentification": transaction.uuid,
          "paymentMetadata":{}
        }, 
        { headers: {
          "Authorization": `Bearer ${neonomicsAuthToken}`,
          "x-session-id": neonomicsSessionId,
          "x-device-id": await NeonomicsUniqueId(user),
          "x-psu-id": senderAccount.bank === "DNB" ? await NeonomicsEncryptSSN("31125461118") : null,
          "accept": `application/json`,
          "content-type":"application/json",
          "x-psu-ip-address": await GetIp(),
          "x-redirect-url": process.env.APP_URL+"complete-payment/neonomics/",
        }}).then( (response) => {
           return response
        }).catch((error) => {
          return error.response
        })
        console.log(NeonomicsTransfer,receiverAccount.iban, senderAccount.iban)


      if ("error" in NeonomicsTransfer || NeonomicsTransfer === undefined)
          return response.status(500).send( {bank:"neonomics", message:"We can't reach Neonomic Banking servers"} )
      console.log("NEONOMICS: Initiating SEPA Credit Transfer\n", NeonomicsTransfer.data)

      if ("errorCode" in NeonomicsTransfer.data && (NeonomicsTransfer.data.errorCode == '1426' || NeonomicsTransfer.data.errorCode == '1428')) {

        let responseConsent = await axios.get( NeonomicsTransfer.data.links[0].href,
          { headers: {
            "Authorization": `Bearer ${neonomicsAuthToken}`,
            "x-session-id": neonomicsSessionId,
            "x-device-id": await NeonomicsUniqueId(user),
            "x-psu-ip-address": await GetIp(),
            "Accept": `application/json`,
            "Content-Type":"application/json",
          }}).then( (response) => {
              return response
          }).catch((error) => {
            return error.response
          })
            
        if ("error" in responseConsent || responseConsent === undefined)
          return response.status(504).send( {bank:"neonomics", message:"We couldn't fetch the consent link, please try again"} )

        console.log("NEONOMICS: Requesting Consent for the SEPA Credit Transfer\n", responseConsent.data)

        console.log(transaction.uuid, "changing to =>", responseConsent.data.paymentId)

        transaction.uuid =  responseConsent.data.paymentId //Should i do this?
        let NeonomicsPayment = await MakePayment(user, counterParty, transaction)
        
        console.log("NEONOMICS: Storing transfer\n", transaction)
        
        return {bank:"neonomics", ...responseConsent.data, ...NeonomicsPayment, url:responseConsent.data.links[0].href}

      } else if ("errorCode" in NeonomicsTransfer.data) {

        return response.status(400).send({...NeonomicsTransfer.data})

      }

    }

  }




  public async OAuthTransactionsCallback ({auth, request, response}: HttpContextContract) {
    let user = await auth.authenticate()
    let neonomicsAuthToken = await GetToken(user,"auth_token","Neonomics") 
    let transaction = await Transaction.findByOrFail('uuid', request.input('code'))
    let counterParty = await User.findOrFail(transaction.user_receiver_id)
    transaction = transaction.serialize()
    transaction.status=1
    let senderAccount = await BankAccount.query().where('user_id', user.id).andWhere('primary', "true").firstOrFail()
    let receiverAccount = await BankAccount.query().where('user_id', transaction.user_receiver_id).andWhere('primary', "true").firstOrFail()
    
    senderAccount.balance = senderAccount.balance - transaction.amount
    receiverAccount.balance = receiverAccount.balance + transaction.amount


    let neonomicsSessionId = await GetToken(user,"sessionId", senderAccount.bank) 
      
    console.log("CHECKING: ", senderAccount.serialize(), receiverAccount.serialize())

      let CHECKFIRSTBackPaymentData = await axios.get( 
        "https://sandbox.neonomics.io/ics/v3/payments/sepa-credit/"+request.input('code'),
        { headers: {
          "Authorization": `Bearer ${neonomicsAuthToken}`,
          "x-session-id": neonomicsSessionId,
          "x-device-id": await NeonomicsUniqueId(user),
          "x-psu-ip-address": await GetIp(),
          "Accept": `application/json`,
          "Content-Type":"application/json",
        }}).then( (response) => {
            return response
        }).catch((error) => {
          return error.response
        })
      console.log("CHECKING OUT FIRST THE PAYMENT INFO", senderAccount.bank , CHECKFIRSTBackPaymentData.data)


    if (senderAccount.bank == "SEB" || senderAccount.bank == "S-Pankki") {

      if (senderAccount.bank == "SEB") {
        console.log(senderAccount.bank, "NO VALIDATION")
        transaction.status = "1"
        let NeonomicsPayment = await MakePayment(user, counterParty, transaction, "Update")
        await senderAccount.save()
        await receiverAccount.save()
        return {...NeonomicsPayment}
      }

      let completePayment = await axios.post( 
        "https://sandbox.neonomics.io/ics/v3/payments/sepa-credit/"+request.input('code')+"/complete",
        {},
        { headers: {
          "Authorization": `Bearer ${neonomicsAuthToken}`,
          "x-session-id": neonomicsSessionId,
          "x-device-id": await NeonomicsUniqueId(user),
          "x-psu-ip-address": await GetIp(),
          "Accept": `application/json`,
          "Content-Type":"application/json",
        }}).then( (response) => {
            return response
        }).catch((error) => {
          return error.response
        })
      console.log("COMPLETE PAYMENT",  completePayment.data)
      if ("errorCode" in completePayment.data) {
        return response.status(400).send({...completePayment.data})
      }

      let getBackPaymentData = await axios.get( 
        "https://sandbox.neonomics.io/ics/v3/payments/sepa-credit/"+request.input('code'),
        { headers: {
          "Authorization": `Bearer ${neonomicsAuthToken}`,
          "x-session-id": neonomicsSessionId,
          "x-device-id": await NeonomicsUniqueId(user),
          "x-psu-ip-address": await GetIp(),
          "Accept": `application/json`,
          "Content-Type":"application/json",
        }}).then( (response) => {
            return response
        }).catch((error) => {
          return error.response
        })
      console.log("GET PAYMENT INFO", getBackPaymentData.data)
      if (getBackPaymentData.data.status === "ACTC" || getBackPaymentData.data.status === "ACSP" || getBackPaymentData.data.status === "ACSC") {
        // I WILL ASSUME I WON'T SEE THE TRANSACTION MADE ON THE API - CONFIRM THE TRANSACTION
        transaction.status = "1"
        let NeonomicsPayment = await MakePayment(user, counterParty, transaction, "Update")
        
        await senderAccount.save()
        await receiverAccount.save()
        return {...NeonomicsPayment}
      } else {
        return response.status(500).send({error: "Unknown Error", message:"Unknown Error, Contact Support"})
      }

    } else { // no validation
      console.log(senderAccount.bank, "NO VALIDATION")
      transaction.status = "1"
      let NeonomicsPayment = await MakePayment(user, counterParty, transaction, "Update")
      await senderAccount.save()
      await receiverAccount.save()
      return {...NeonomicsPayment}
    }
  }







}

