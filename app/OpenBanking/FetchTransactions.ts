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
        ).then( (response) => { console.log(response); return response })
        .catch((error) => {console.log(error.response); return error.response });

        if (responseDB === undefined)
            return [] //{error:504, message:"We couldn't fetch the transactions, please try again"}
        if ("code" in responseDB.data)
            return [] //{error:500, message:responseDB.data.code+": "+responseDB.data.message}
        if (responseDB.data.transactions === undefined)
            return [] //{error:500, message:"We couldn't fetch the transactions, please try again"}

        let transactionsDB = []
        for (let [index,transaction] of responseDB.data.transactions.entries()) {
        	transactionsDB.push({
        		fetch_type: transaction.amount >= 0 ?"credit":"debit" ,
            party: transaction.counterPartyName, 
        		amount: transaction.amount >= 0 ? transaction.amount : transaction.amount *-1,
        		status: "1",
        		created_at: transaction.bookingDate,
        		updated_at: transaction.bookingDate
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
          console.log(responseRB.data)
          if (responseRB === undefined)
            return [] //return {error:504, message:"We couldn't fetch the transactions, please try again"}
          if ("httpCode" in responseRB.data && responseRB.data.httpCode != 200)
            return [] //return {error:responseRB.data.httpCode, message:responseRB.data.httpCode+": "+responseRB.data.message}

			    let transactionsRB = []
			    for (let [index,transaction] of responseRB.data.transactions.booked.entries()) {
			  	transactionsRB.push({
              fetch_type: transaction.transactionAmount.amount >= 0 ?"credit":"debit" ,
              party: transaction.transactionAmount.amount >= 0 ? transaction.debtorName?transaction.debtorName:"NONAME" : transaction.creditorName ? transaction.creditorName :"NONAME" ,
              amount: transaction.transactionAmount.amount >= 0 ? transaction.transactionAmount.amount : transaction.transactionAmount.amount *-1,
              status: "1",
              created_at: transaction.bookingDate,
              updated_at: transaction.bookingDate
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
        let transactionsN = []
			  for (let [index,transaction] of responseN.data.entries()) {
          transactionsN.push({
            fetch_type: transaction.creditDebitIndicator === "CRDT" ? "credit" : "debit",
            party: "NONAME",//transaction.transactionReference, 
            amount: transaction.transactionAmount.amount,
            status: "1",
            created_at: transaction.bookingDate,
            updated_at: transaction.bookingDate
          })
			  }
			  return transactionsN
  

        break;
    }


}