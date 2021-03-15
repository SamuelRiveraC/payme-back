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

export default async function GetBankAccounts (user,Bank) {

    switch (Bank) {
      case "deutschebank":
        let DB_access_token = await GetToken(user,"auth_token",Bank) 
        let responseDB = await axios.get( "https://simulator-api.db.com/gw/dbapi/v1/cashAccounts",
          {headers: { Authorization: `Bearer ${DB_access_token}` }}
        ).then( (response) => { return response })
        .catch((error) => {return error.response });
        if (responseDB === undefined)
            return {error:504, message:"We couldn't fetch the bank accounts, please try again"}
        if ("errorCode" in response.data)
            return {error:500, message:responseDB.data.errorCode+": "+responseDB.data.message}
        return responseDB.data
        break;       

      case "rabobank":
          let RB_access_token = await GetToken(user,"auth_token",Bank) 
          let responseRB = await axios.get( "https://api-sandbox.rabobank.nl/openapi/sandbox/payments/account-information/ais/accounts",
          await RabobankRequestHeaderAccounts(RB_access_token))
          .then( (response) => { return response })
          .catch((error) => { return error.response });

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
        break;

      default: //danger Should be neonomics banks 

        let auth_token = await GetToken(user,"auth_token","Neonomics") 
        let sessionId = await GetToken(user,"sessionId",Bank) 

        let responseN = await axios.get( "https://sandbox.neonomics.io/ics/v3/accounts",
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
            return {error:504, message:"We couldn't fetch the bank accounts, please try again"}
        if ("errorCode" in responseN.data)
            return {error:500, message:responseN.data.errorCode+": "+responseN.data.message}
        return responseN.data


        break;
    }


}