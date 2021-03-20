import axios from "axios"
import GetToken from "App/OpenBanking/GetToken"
import RabobankRequestHeaderAccounts from 'App/OpenBanking/RabobankRequestHeaderAccounts'
import { v4 as uuid } from 'uuid'
import crypto from 'crypto'


const IPADDRESS = "109.74.179.3" //"127.0.0.0"

const crypto = require('crypto');
const iv = crypto.randomBytes(12);
const ssn = "31125461118"
const key= Buffer.from(process.env.neonomics_raw_key, 'base64');
const cipher = crypto.createCipheriv('aes-128-gcm', key, iv, { authTagLength:16 });
let enc = Buffer.concat([cipher.update(ssn), cipher.final(), cipher.getAuthTag()]);
const DBN_SSN_ENCRYPTED = Buffer.concat([iv, enc]).toString('base64')

export default async function FetchTransactions(user, BankAccount) {

    switch (BankAccount.bank) {
      case "deutschebank":
        let DB_access_token = await GetToken(user,"auth_token",BankAccount.bank) 
        let responseDB = await axios.get(
          "https://simulator-api.db.com:443/gw/dbapi/banking/transactions/v2/?iban="+BankAccount.iban+"&sortBy=bookingDate%5BDESC%5D&limit=10&offset=0"

          , {headers: { Authorization: `Bearer ${DB_access_token}` }}
        ).then( (response) => { return response })
        .catch((error) => { return error.response });

        console.log(responseDB.data)

        if (responseDB.data === undefined)
            return [] //{error:504, message:"We couldn't fetch the transactions, please try again"}
        if ("code" in responseDB.data)
            return [] //{error:500, message:responseDB.data.code+": "+responseDB.data.message}
        if (responseDB.data.transactions === undefined)
            return [] //{error:500, message:"We couldn't fetch the transactions, please try again"}
        

        /*{
          originIban: 'DE10010000000000007706',
          amount: 69,
          counterPartyName: 'Tom Winter',
          counterPartyIban: 'DE10010000000000007659',
          bookingDate: '2021-03-19',
          currencyCode: 'EUR',
          paymentIdentification: 'RTEeab2a1c1-a4e1-4a29-aa4d-44cff0727bdb',
          id: "something like a base64 but isnt"
        }*/

        let transactionsDB = []
        for (let [index,transaction] of responseDB.data.transactions.entries()) {
          let fetch_type = "credit"

          if (transaction.paymentIdentification === "XYZ") {
            fetch_type = transaction.amount >= 0 ?"credit":"debit"
          } else {
            fetch_type = transaction.amount <= 0 ?"credit":"debit"
          }



        	transactionsDB.push({
            fetch_type:  fetch_type,
            uuid: transaction.paymentIdentification.replace("RTE",""),
            party: transaction.counterPartyName, 
        		amount: transaction.amount >= 0 ? transaction.amount : transaction.amount *-1, //Always show a positive number
        		status: "1",
        		created_at: transaction.bookingDate+` 0${index}:00`,
        		updated_at: transaction.bookingDate+` 0${index}:00`,
            color: "0018a8"
        	})
        }
        return transactionsDB

        break;       

      case "rabobank":
          let RB_access_token = await GetToken(user,"auth_token", BankAccount.bank) 
          let responseRB = await axios.get( 
          	"https://api-sandbox.rabobank.nl/openapi/sandbox/payments/account-information/ais/accounts/"+BankAccount.resource_id+"/transactions?bookingStatus=booked",
          await RabobankRequestHeaderAccounts(RB_access_token))
          .then( (response) => { return response })
          .catch((error) => { return error.response });

          console.log(responseRB.data.transactions.booked[0])

          if (responseRB === undefined)
            return [] //return {error:504, message:"We couldn't fetch the transactions, please try again"}
          if ("httpCode" in responseRB.data && responseRB.data.httpCode != 200)
            return [] //return {error:responseRB.data.httpCode, message:responseRB.data.httpCode+": "+responseRB.data.message}

          /*{
            entryReference: '8860',
            bookingDate: '2021-03-18',
            valueDate: '2021-03-18',
            transactionAmount: { currency: 'EUR', amount: '6000.0' },
            creditorAccount: { iban: 'NL80RABO1127000002', currency: 'EUR' },
            creditorAgent: 'RABONL2U',
            debtorAccount: { iban: 'NL62RABO0838250920' },
            debtorName: 'Business ST A',
            remittanceInformationUnstructured: 'Description ST 1',
            initiatingPartyName: 'TRX ST',
            raboBookingDateTime: '2021-03-18T14:21:00Z',
            raboDetailedTransactionType: '633',
            raboTransactionTypeName: 'st',
            reasonCode: 'AG01'
          }*/

			    let transactionsRB = []
			    for (let [index,transaction] of responseRB.data.transactions.booked.entries()) {
            // Maybe check with the creditoraccount and bank iban
			  	transactionsRB.push({
              //UUID
              fetch_type: transaction.transactionAmount.amount >= 0 ?"credit":"debit" ,
              party: transaction.transactionAmount.amount >= 0 ? transaction.debtorName?transaction.debtorName:"NONAME" : transaction.creditorName ? transaction.creditorName :"NONAME" ,
              amount: transaction.transactionAmount.amount >= 0 ? transaction.transactionAmount.amount : transaction.transactionAmount.amount *-1,
              status: "1",
              created_at: transaction.raboBookingDateTime,
              updated_at: transaction.raboBookingDateTime,
              color: "FF6600"
            })
			    }
			  return transactionsRB

        break;

      default: //danger Should be neonomics banks 

        let auth_token = await GetToken(user,"auth_token","Neonomics") 
        let sessionId = await GetToken(user,"sessionId",BankAccount.bank) 

        let responseN = await axios.get( "https://sandbox.neonomics.io/ics/v3/accounts/"+BankAccount.resource_id+"/transactions",
          { headers: { Authorization: `Bearer ${auth_token}`,
            Accept: `application/json`, "x-device-id": "PayMe-"+user.id,
            "x-psu-ip-address":IPADDRESS, "x-session-id": sessionId
          , "x-psu-id": DBN_SSN_ENCRYPTED
          }}).then( (response) => {
            return response // should return bank acccounts
          }).catch((error) => {
            return error.response
          });

        if (responseN === undefined)
          return [] //return {error:504, message:"We couldn't fetch the transactions, please try again"}
        if ("errorCode" in responseN.data)
          return [] //return {error:500, message:responseN.data.errorCode+": "+responseN.data.message}
        console.log(responseN.data)
        /*

        {
        "id": "ACCOUNT_1_ID",
        "iban": "NO2390412263056",
        "bban": "90412263056",
        "accountName": "Brukskonto",
        "accountType": "TAXE",
        "balances": [
                {
                "amount": "9049.32",
                "currency": "NOK",
                "type": "CLSG"
                },
                {
                "amount": "10000",
                "currency": "NOK",
                "type": "EXPN"
                }
            ]
        },
        */

        let transactionsN = []
			  for (let [index,transaction] of responseN.data.entries()) {
          transactionsN.push({
            //UUID
            fetch_type: transaction.creditDebitIndicator === "CRDT" ? "credit" : "debit",
            party: transaction.transactionReference, //"NONAME"
            amount: transaction.transactionAmount.value,
            status: "1",
            created_at: transaction.bookingDate,
            updated_at: transaction.bookingDate,
            color: "1F69E5"
          })
			  }
			  return transactionsN.slice(0,10)
  

        break;
    }


}