import axios from "axios"
import GetToken from "App/OpenBanking/GetToken"
import RabobankRequestHeaderAccounts from 'App/OpenBanking/RabobankRequestHeaderAccounts'
import NeonomicsUniqueId from 'App/OpenBanking/NeonomicsUniqueId'
import NeonomicsEncryptSSN from 'App/OpenBanking/NeonomicsEncryptSSN'
import GetIp from "App/OpenBanking/GetIp"

export default async function GetBankAccounts (user,Bank) {

    switch (Bank) {
      case "deutschebank":
          let DB_access_token = await GetToken(user,"auth_token",Bank) 
          let responseDB = await axios.get( "https://simulator-api.db.com/gw/dbapi/v1/cashAccounts",
            {headers: { Authorization: `Bearer ${DB_access_token}` }}
          ).then( (response) => { return response })
          .catch((error) => {return error.response })
          if (responseDB === undefined)
              return {error:504, message:"We couldn't fetch the bank accounts, please try again"}
          if ("errorCode" in responseDB.data)
              return {error:500, message:responseDB.data.errorCode+": "+responseDB.data.message}
          return responseDB.data
        break       

      case "rabobank":
          let RB_access_token = await GetToken(user,"auth_token",Bank) 
          let responseRB = await axios.get( "https://api-sandbox.rabobank.nl/openapi/sandbox/payments/account-information/ais/accounts",
          await RabobankRequestHeaderAccounts(RB_access_token))
          .then( (response) => { return response })
          .catch((error) => { return error.response })

          if (responseRB === undefined)
            return {error:504, message:"We couldn't fetch the bank accounts, please try again"}
          if ("errorCode" in responseRB.data)
              return {error:500, message:responseRB.data.errorCode+": "+responseRB.data.message}
          
          let bankAccounts = responseRB.data.accounts

          for (const account of bankAccounts) {
            let accountBalance = await axios.get( "https://api-sandbox.rabobank.nl/openapi/sandbox/payments/account-information/ais/accounts/"+account.resourceId+"/balances",
              await RabobankRequestHeaderAccounts(RB_access_token))
              .then( (response) => { return response.data })
              .catch((error) => { return error.response.data })
            account.balance = accountBalance.balances[0].balanceAmount 
          }
          return bankAccounts
        break

      default: //danger Should be neonomics banks 

        let neonomicsAuthToken = await GetToken(user,"auth_token","Neonomics") 
        let neonomicsSessionId = await GetToken(user,"sessionId",Bank) 

        let responseN = await axios.get( "https://sandbox.neonomics.io/ics/v3/accounts",
          { headers: {
            "Authorization": `Bearer ${neonomicsAuthToken}`,
            "x-session-id": neonomicsSessionId,
            "x-device-id": await NeonomicsUniqueId(user),
            "Accept": `application/json`,
            "Content-Type":"application/json",
            "x-psu-ip-address": await GetIp(),
            "x-redirect-url": process.env.APP_URL+"add-account/neonomics/",
          }}).then( (response) => {
            return response // should return bank acccounts
          }).catch((error) => {
            return error.response
          })

        console.log("3 - NEONOMICS: Getting Bank Account for real ", Bank, neonomicsSessionId)
        if (responseN === undefined)
            return {error:504, message:"We couldn't fetch the bank accounts, please try again"}
        if ("errorCode" in responseN.data)
            return {error:500, message:responseN.data.errorCode+": "+responseN.data.message}

        console.log(JSON.stringify(responseN.data))
        return responseN.data


        break
    }


}