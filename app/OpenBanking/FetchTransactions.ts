import axios from "axios"
import GetToken from "App/OpenBanking/GetToken"
import RabobankRequestHeaderAccounts from 'App/OpenBanking/RabobankRequestHeaderAccounts'

import NeonomicsUniqueId from 'App/OpenBanking/NeonomicsUniqueId'
import NeonomicsEncryptSSN from 'App/OpenBanking/NeonomicsEncryptSSN'
import GetIp from "App/OpenBanking/GetIp"

export default async function FetchTransactions(user, BankAccount) {

    switch (BankAccount.bank) {
      case "deutschebank":
        let DB_access_token = await GetToken(user,"auth_token",BankAccount.bank) 
        let responseDB = await axios.get(
          "https://simulator-api.db.com:443/gw/dbapi/banking/transactions/v2/?iban="+BankAccount.iban+"&sortBy=bookingDate%5BDESC%5D&limit=10&offset=0"

          , {headers: { Authorization: `Bearer ${DB_access_token}` }}
        ).then( (response) => { return response })
        .catch((error) => { return error.response })

        if (responseDB.data === undefined)
            return [] //{error:504, message:"We couldn't fetch the transactions, please try again"}
        if ("code" in responseDB.data)
            return [] //{error:500, message:responseDB.data.code+": "+responseDB.data.message}
        if (responseDB.data.transactions === undefined)
            return [] //{error:500, message:"We couldn't fetch the transactions, please try again"}
        
        let transactionsDB = []
        for (let [index,transaction] of responseDB.data.transactions.entries()) {
          let fetch_type = "credit"

          if (transaction.paymentIdentification === "XYZ") {
            fetch_type = transaction.amount >= 0 ?"credit":"debit"
          } else {
            fetch_type = transaction.amount <= 0 ?"credit":"debit"
          }

          console.log("Deutschebank "+transaction.bookingDate+`T0${index}:00:000Z`)

        	

          transactionsDB.push({
            fetch_type:  fetch_type,
            uuid: transaction.paymentIdentification.replace("RTE",""),
            party: transaction.counterPartyName, 
        		amount: transaction.amount >= 0 ? transaction.amount : transaction.amount *-1, //Always show a positive number
        		status: "1",
        		created_at: new Date(transaction.bookingDate+` 0${index}:00:000Z`).getTime(),
        		updated_at: new Date(transaction.bookingDate+` 0${index}:00:000Z`).getTime(),
            color: "0018a8"
        	})
        }
        return transactionsDB

        break       

      case "rabobank":
          let RB_access_token = await GetToken(user,"auth_token", BankAccount.bank) 
          let responseRB = await axios.get( 
          	"https://api-sandbox.rabobank.nl/openapi/sandbox/payments/account-information/ais/accounts/"+BankAccount.resource_id+"/transactions?bookingStatus=booked&size=10",
          await RabobankRequestHeaderAccounts(RB_access_token))
          .then( (response) => { return response })
          .catch((error) => { return error.response })

          if (responseRB === undefined)
            return [] //return {error:504, message:"We couldn't fetch the transactions, please try again"}
          if ("httpCode" in responseRB.data && responseRB.data.httpCode != 200)
            return [] //return {error:responseRB.data.httpCode, message:responseRB.data.httpCode+": "+responseRB.data.message}

			    let transactionsRB = []
			    for (let [index,transaction] of responseRB.data.transactions.booked.entries()) {
            
            // Maybe check with the creditoraccount and bank iban
          console.log("Rabobank "+transaction.raboBookingDateTime)

			  	transactionsRB.push({
              //UUID
              fetch_type: transaction.transactionAmount.amount >= 0 ?"credit":"debit" ,
              party: transaction.transactionAmount.amount >= 0 ? transaction.debtorName?transaction.debtorName:"NONAME" : transaction.creditorName ? transaction.creditorName :"NONAME" ,
              amount: transaction.transactionAmount.amount >= 0 ? transaction.transactionAmount.amount : transaction.transactionAmount.amount *-1,
              status: "1",
              created_at: new Date(transaction.raboBookingDateTime).getTime(),
              updated_at: new Date(transaction.raboBookingDateTime).getTime(),
              color: "FF6600"
            })
			    }
			  return transactionsRB

        break



















      default: //danger Should be neonomics banks 

        let auth_token = await GetToken(user,"auth_token","Neonomics") 
        let sessionId = await GetToken(user,"sessionId",BankAccount.bank) 

        let responseN = await axios.get( "https://sandbox.neonomics.io/ics/v3/accounts/"+BankAccount.resource_id+"/transactions",
          { headers: { Authorization: `Bearer ${auth_token}`,
            Accept: `application/json`, 
            "x-device-id": await NeonomicsUniqueId(user),
            "x-session-id": sessionId,
            "x-psu-ip-address": await GetIp(),
            "x-psu-id": BankAccount.bank === "DNB" ? await NeonomicsEncryptSSN("31125461118") : null
          }}).then( (response) => {
            return response // should return bank acccounts
          }).catch((error) => {
            return error.response
          })

        if (responseN === undefined)
          return [] //return {error:504, message:"We couldn't fetch the transactions, please try again"}
        if ("errorCode" in responseN.data)
          return [] //return {error:500, message:responseN.data.errorCode+": "+responseN.data.message}
        //console.log(responseN.data)
        
        let transactionsUnformatted = responseN.data.entries()

        let transactionsN = []

			  for (let [index,transaction] of transactionsUnformatted) {

          console.log("Neonomics "+transaction.bookingDate)

          transactionsN.push({
            //UUID
            fetch_type: transaction.creditDebitIndicator === "CRDT" ? "credit" : "debit",
            party: transaction.transactionReference, //"NONAME"
            amount: transaction.transactionAmount.value,
            status: "1",
            created_at: new Date(transaction.bookingDate).getTime(),
            updated_at: new Date(transaction.bookingDate).getTime(),
            color: "1F69E5"
          })
			  }
        console.log(transactionsN.slice(0,10))
			  return transactionsN.slice(0,10)
  






















        break
    }


}