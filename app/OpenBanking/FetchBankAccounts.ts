import Qs from "qs"
import axios from "axios"
import GetToken from "App/OpenBanking/GetToken"

const IPADDRESS = "109.74.179.3" //"127.0.0.0"
const DBN_SSN_ENCRYPTED = "ARxbvsVFZnYiYrkVCDOn1AE0EY955HQVMZwSOdV0eSg7QQ2kzfVIlY7Hr/D3"


export default async function GetBankAccounts (user,Bank) {

    switch (Bank) {
      case "deutschebank":
        let DB_access_token = await GetToken(user,"access_token",Bank) 
        return await axios.get( "https://simulator-api.db.com/gw/dbapi/v1/cashAccounts",
          {headers: { Authorization: `Bearer ${DB_access_token}` }}
        ).then( (response) => { return response.data })
        .catch((error) => {return error.response.data });
        break;       

      case "rabobank":
        const { uuidv4 } = require('uuidv4');
      /*
        const crypto = require('crypto');
        var hash = crypto.createHash('sha512');

        var digest = Buffer.from( hash.update({}, 'utf-8' ) ).toString('base64');

        gen_hash= data.digest('hex');

        console.log("hash : " + gen_hash);
      */

        //AIS = date+digest+x-request-id
        let digest = Buffer.from("").toString('base64')


        let RB_access_token = await GetToken(user,"access_token",Bank) 
        return await axios.get( "https://api-sandbox.rabobank.nl/openapi/sandbox/payments/account-information/ais/accounts",
          { headers: {
              Authorization: `Bearer ${RB_access_token}`, 
              accept: `application/json`, 
              date: `${new Date().toUTCString()}`, 
              // "psu-ip-address": ``, //There is no limit in amount of calls
              "x-request-id": uuidv4(), // CREATE UUID ¿just because? 
              "tpp-signature-certificate": process.env.rabobank_signing_cer,
              "x-ibm-client-id": process.env.rabobank_client, 

              digest: `sha-512=${digest}`,
              signature: ``, //For description and examples check the documentation section.

          } } //response.data.access_token
          ).then( (response) => { return response.data })
          .catch((error) => { return error.response.data });
        break;

      default: //danger Should be neonomics banks 

        let auth_token = await GetToken(user,"auth_token","Neonomics") 
        let sessionId = await GetToken(user,"sessionId",Bank) 

        return await axios.get( "https://sandbox.neonomics.io/ics/v3/accounts",
          { headers: { Authorization: `Bearer ${auth_token}`,
            Accept: `application/json`, "x-device-id": "PayMe-"+user.id,
            "x-psu-ip-address":IPADDRESS, "x-session-id": sessionId
          , "x-psu-id": DBN_SSN_ENCRYPTED
          }}).then( (response) => {
            return response.data // should return bank acccounts
          }).catch((error) => {
            return error.response.data
          });
        break;
    }


}