import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Transaction from 'App/Models/Transaction'
import BankAccount from 'App/Models/BankAccount'
import Notification from 'App/Models/Notification'

import FetchAuthToken from 'App/OpenBanking/FetchAuthToken'
import FetchAccessToken from 'App/OpenBanking/FetchAccessToken'
import FetchRefreshToken from 'App/OpenBanking/FetchRefreshToken'
import FetchBankAccounts from 'App/OpenBanking/FetchBankAccounts'
import FetchTransactions from 'App/OpenBanking/FetchTransactions'

import MakeRequest from 'App/OpenBanking/MakeRequest'
import MakePayment from 'App/OpenBanking/MakePayment'


import GetToken from "App/OpenBanking/GetToken"
import Database from '@ioc:Adonis/Lucid/Database'

import axios from "axios"
import { v4 as uuid } from 'uuid'


export default class OpenBankingController {

  public async OAuthAuth ({auth, request, response}: HttpContextContract) {
    const user = await auth.authenticate()
    const bank = request.input("bank")
    const code = request.input("code")
    
    let AuthToken = await FetchAuthToken(user,bank,code)
    if ("error" in AuthToken) { 
      return response.status(AuthToken.error).send({...AuthToken})
    } else if ("auth_url" in AuthToken){

      return {auth_url: AuthToken.auth_url}

    } else if ("consent_url" in AuthToken){
      
      await auth.use('api').generate(user, {
        name: AuthToken.bank,
        type: "sessionId",
        token: AuthToken.sessionId, 
      })
      return {consent_url: AuthToken.consent_url}

    } else if ("banks" in AuthToken) {

      await auth.use('api').generate(user, {
        name: "Neonomics",
        type: "auth_token",
        token: AuthToken.access_token, 
        expiresIn: AuthToken.expires_in+" seconds"
      })
      await auth.use('api').generate(user, {
        name: "Neonomics",
        type: "refresh_token",
        token: AuthToken.refresh_token  , 
        expiresIn: AuthToken.refresh_expires_in+" seconds"
      })
      return {banks: AuthToken.banks}

    }
  }


  public async urgent ({}: HttpContextContract) {
    let user = {id:1, first_name:"Angela", last_name:"Deutschebank" }
    let BankAccount = {bank:"deutschebank", iban: "DE10010000000000007659"}
    return await FetchTransactions(user,BankAccount)
    //BankAccount = {resource_id:"Tkw4MFJBQk8xMTI3MDAwMDAyOkVVUg",bank:"rabobank", iban: "NL80RABO1127000002"}
    //let t2 = await FetchTransactions(user,BankAccount)
    //let BankAccount = {resource_id:"MTIwMzYyMTI1MzM",bank:"DNB", iban: "NO3312036212533"}
    //let t3 = await FetchTransactions(user,BankAccount)
    
    //return t1.concat(["RABOBANK"],t2,["NEONOMICS"],t3)
  }


  public async refreshData ({auth, response}: HttpContextContract) {
    //CHECK IF EXPIRED
    const user = await auth.authenticate()
    let newToken = {}
    let deutschebank = await GetToken(user,"refresh_token","deutschebank")
    let rabobank = await GetToken(user,"refresh_token","rabobank")
    let neonomics = await GetToken(user,"refresh_token","Neonomics")
    console.log(deutschebank,rabobank,neonomics)

    // access_token = expires_in: 599 , refresh_token = Permanent?



    if (deutschebank !== undefined && deutschebank !== null) {
      newToken = await FetchRefreshToken(user,deutschebank,"deutschebank") 
      if (!("error" in newToken)) {
        await Database.from('api_tokens')
          .where('user_id', user.id)
          .andWhere('name', "deutschebank")
          .andWhere('type', "auth_token")
          .delete()

        await auth.use('api').generate(user, {
          name: "deutschebank", type: "auth_token",
          token: newToken.access_token, 
          expiresIn: newToken.expires_in+" seconds"
        })
      }
    }

    // access_token = expires_in: 3600, refresh_token = refresh_token_expires_in : 1 Month
    if (rabobank !== undefined && rabobank !== null) {
      newToken = await FetchRefreshToken(user,rabobank,"rabobank")
      if (!("error" in newToken)) {
        await Database.from('api_tokens').where('user_id', user.id).andWhere('name', "rabobank").delete()
        await auth.use('api').generate(user, {
          name: "rabobank", type: "auth_token",
          token: newToken.access_token, 
          expiresIn: newToken.expires_in+" seconds"
        })
        await auth.use('api').generate(user, {
          name: "rabobank", type: "refresh_token",
          token: newToken.refresh_token  , 
          expiresIn: newToken.refresh_expires_in+" seconds"
        })
      }
    }

    if (neonomics !== undefined && neonomics !== null) {
      newToken = await FetchRefreshToken(user,neonomics,"Neonomics")
      if (!("error" in newToken)) {
        await Database.from('api_tokens').where('user_id', user.id).andWhere('name', "Neonomics").delete()
        await auth.use('api').generate(user, {
          name: "neonomics", type: "auth_token",
          token: newToken.access_token, 
          expiresIn: newToken.expires_in+" seconds"
        })
        await auth.use('api').generate(user, {
          name: "neonomics", type: "refresh_token",
          token: newToken.refresh_token  , 
          expiresIn: newToken.refresh_expires_in+" seconds"
        })
      }
    }

  }

  public async access_token ({auth, request}: HttpContextContract) {
    const user = await auth.authenticate()
    const bank = request.input("bank")
    return await GetToken(user,"auth_token", bank)
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

        console.log(AccessToken)
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
              alias: `${account.productDescription} (${user.last_name})`,
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
              alias: `${account.ownerName} (${user.last_name})`,
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
      console.log("BANK ACCOUNTS:\n", JSON.stringify(GetBankAccounts))
      
      if ("error" in GetBankAccounts) { 
        return response.status(GetBankAccounts.error).send({...GetBankAccounts})
      } else if ( GetBankAccounts.length > 0) {
        await BankAccount.query().where('user_id', user.id).update({ primary: 'false' })
      

        for (const [index, account] of GetBankAccounts.entries()) {
          await BankAccount.updateOrCreate({iban: account.iban, user_id: user.id}, {
            resource_id: account.id,
            bank: bank,
            alias: `${account.accountName} (${user.last_name})`,
            balance: account.balances[0].amount < 0 ? account.balances[0].amount*-1 : account.balances[0].amount, //FIX FOR NOW TAKE CARE WITH NEGATIVE NUMBERS IT SEEMS
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

    let validateAmount = parseFloat(request.input("amount")).toFixed(2)
    
    console.log("\n\n",validateAmount, "-",parseFloat(validateAmount),"\n\n")

    let transaction = {
      uuid: uuid(),
      user_receiver_id: 0,
      user_sender_id: 0,
      amount:  validateAmount,
      status:  0
    }

    if (transactionType === "Request") {
      counterParty = await User.findOrFail(request.input("counterParty")) 
      transaction.user_sender_id   = counterParty.id
      transaction.user_receiver_id = user.id

      return await MakePayment(user, counterParty, transaction)

    } else if (transactionType == "Payment") {
      transaction = (await Transaction.findOrFail(request.input("transaction"))).serialize()
      counterParty = await User.findOrFail(transaction.user_receiver_id) 

      if (transaction.user_sender_id !== user.id)
        return response.status(400).send( {code:"E_NOT_THE_USER_TRANSACTION"} )

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
        
        console.log(JSON.stringify(OTPResponse))
        if ("code" in OTPResponse || OTPResponse === undefined)
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
        });

        console.log(JSON.stringify(OTPResponse))
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

          console.log(JSON.stringify(DBResponse))
          if ("code" in DBResponse || DBResponse === undefined)
            return response.status(500).send( {bank:"deutschebank", step:"sendTransaction", code:DBResponse.message ? DBResponse.message : "We can't reach Deutschebank Server"} )
          
          if (false) { //#SUAYIP: TRANSACTION TO LOCALHOST SET TO FLASE
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
      }

      

    } /* else if (primaryAccount.bank === "rabobank") {

      //get and return link
      /*
      curl --request POST \
        --url https://api-sandbox.rabobank.nl/openapi/sandbox/payments/payment-initiation/pis/v1/payments/sepa-credit-transfers \
        --header 'accept: application/json' \
        --header 'consent-id: REPLACE_THIS_VALUE' \
        --header 'content-type: REPLACE_THIS_VALUE' \
        --header 'date: REPLACE_THIS_VALUE' \
        --header 'digest: REPLACE_THIS_VALUE' \
        --header 'psu-accept: REPLACE_THIS_VALUE' \
        --header 'psu-accept-charset: REPLACE_THIS_VALUE' \
        --header 'psu-accept-encoding: REPLACE_THIS_VALUE' \
        --header 'psu-accept-language: REPLACE_THIS_VALUE' \
        --header 'psu-corporate-id: REPLACE_THIS_VALUE' \
        --header 'psu-corporate-id-type: REPLACE_THIS_VALUE' \
        --header 'psu-device-id: REPLACE_THIS_VALUE' \
        --header 'psu-geo-location: GEO:52.506931,13.144558' \
        --header 'psu-http-method: REPLACE_THIS_VALUE' \
        --header 'psu-id: REPLACE_THIS_VALUE' \
        --header 'psu-id-type: REPLACE_THIS_VALUE' \
        --header 'psu-ip-address: REPLACE_THIS_VALUE' \
        --header 'psu-ip-port: REPLACE_THIS_VALUE' \
        --header 'psu-user-agent: REPLACE_THIS_VALUE' \
        --header 'signature: REPLACE_THIS_VALUE' \
        --header 'tpp-explicit-authorisation-preferred: REPLACE_THIS_VALUE' \
        --header 'tpp-nok-redirect-uri: REPLACE_THIS_VALUE' \
        --header 'tpp-redirect-preferred: REPLACE_THIS_VALUE' \
        --header 'tpp-redirect-uri: REPLACE_THIS_VALUE' \
        --header 'tpp-signature-certificate: ++T3u+++/++//++/+//==' \
        --header 'x-ibm-client-id: Client ID' \
        --header 'x-request-id: REPLACE_THIS_VALUE' \
        --data 
          {
            "creditorAccount": {
              "currency": "EUR",
              "iban": "NL10RABO0123456789"
            },
            "creditorAddress": {
              "buildingNumber": "8",
              "country": "NL",
              "postcode": "2456RL",
              "streetName": "Utrechtstraat",
              "townName": "Utrecht"
            },
            "creditorAgent": "RABONL2U",
            "creditorName": "Company",
            "debtorAccount": {
              "currency": "EUR",
              "iban": "NL10RABO0912345678"
            },
            "endToEndIdentification": "PI-123456789",
            "instructedAmount": {
              "content": "10.25",
              "currency": "EUR"
            },
            "remittanceInformationUnstructured": "Ref Number Merchant 235839479.3434",
            "requestedExecutionDate": "2014-12-09T00:00:00.000Z"
          }



          REPONSE
          {
            "_links": {
              "scaRedirect": {
                "href": "pulzah"
              },
              "scaStatus": {
                "href": "mumte"
              },
              "self": {
                "href": "teop"
              },
              "startAuthorisationWithAuthenticationMethodSelection": {
                "href": "kileazed"
              },
              "startAuthorisationWithEncryptedPsuAuthentication": {
                "href": "juvlavbi"
              },
              "startAuthorisationWithPsuAuthentication": {
                "href": "uhbiowr"
              },
              "startAuthorisationWithPsuIdentification": {
                "href": "foube"
              },
              "startAuthorisationWithTransactionAuthorisation": {
                "href": "atcicwad"
              },
              "starztAuthorisation": {
                "href": "vecj"
              },
              "status": {
                "href": "todnu"
              }
            },
            "paymentId": "a1d7ec2b-f713-4560-9277-291736d026f7",
            "psuMessage": "61",
            "tppMessages": [
              {
                "category": "WARNING",
                "code": "SCA_METHOD_UNKNOWN",
                "path": "jepiwujb",
                "text": ""
              }
            ],
            "transactionStatus": "ACCP"
          }
          
        */
          
/*    } else {

      /*
        BACKEND: REQUEST

        curl -X POST https://sandbox.neonomics.io/ics/v3/payments/sepa-credit \
        -H "Authorization:Bearer <ACCESS_TOKEN>" \
        -H "x-device-id:example_id_for_quickstart" \
        -H "Content-Type:application/json" \
        -H "Accept:application/json" \
        -H "x-session-id:<SESSION_ID>" \
        -H "x-psu-ip-address: 109.74.179.3" \
        -d '{
          "creditorAccount": {
            "iban": "NO6590412329715"
          },
          "debtorAccount": {
            "iban": "NO2390412263056"
          },
          "debtorName": "Juanita Doe",
          "creditorName": "John Smit",
          "remittanceInformationUnstructured": "My test payment",
          "instrumentedAmount": "100.00",
          "currency": "EUR",
          "endToEndIdentification": "example-123456789-id",
          "paymentMetadata": {}
        }'


        BACKEND: RESPONSE TO GET AUTH

        {
          "id": "366c893e-4649-4692-8ade-a30d190e5c15",
          "errorCode": "1428",
          "message": "This payment requires strong customer authorization. Please use the authorization URL provided to continue, 
          then call the payment complete end-point after authorizing.",
          "source": "C",
          "type": "CONSENT",
          "timestamp": 1575379181868,
          "links": [
            {
              "type": "GET",
              "rel": "payment",
              "href": "https://sandbox.neonomics.io/ics/v3/payments/sepa-credit/05a072c7-9a6f-4170-ac61-9bd70512a440/authorize",
               "meta": 
               {
                    "id": "05a072c7-9a6f-4170-ac61-9bd70512a440"
                }
            }
          ]
        }

        BACKEND: REQUEST OF THE AUTH


          curl -X GET  <AUTHORIZATION_URL> \
          -H "Authorization:Bearer <ACCESS_TOKEN>" \
          -H "Accept:application/json" \
          -H "x-device-id:example_id_for_quickstart" \
          -H "x-psu-ip-address:109.74.179.3" \
          -H "x-session-id:<SESSION_TOKEN>"

        
        BACKEND:   => SEND LINK TO FRONT


        {
          "paymentId": "<PAYMENT_ID>",
          "message": "Please use the Authorization Url to continue.",
          "links": [
            {
              "type": "GET",
              "rel": "Authorization URL",
              "href": "https://openbanking.sbanken.no/tap-sandbox/9710/?route_secesb_id=2&flow=psd2&state=8cda5e87-1fbc-4d82-8f5b-c13351d8c911&context=PRIVATE"
            }
          ]
        }


      */
/*
    }





  }
*/
}

/*


axios.patch( "https://simulator-api.db.com:443/gw/dbapi/others/onetimepasswords/v2/single/"+ID, {
  "response": authkey
},{
  headers: { Authorization: `Bearer ${key}` }
}).then( (response) => {
  setOTP(response.data.otp)
}).catch((error) => {
  setID(null)
  executeOTPMethod()
  alert(error.response.data.message)
})   

*/