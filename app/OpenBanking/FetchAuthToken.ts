import Qs from "qs"
import axios from "axios"
import GetToken from "App/OpenBanking/GetToken"
import NeonomicsUniqueId from 'App/OpenBanking/NeonomicsUniqueId'
import NeonomicsEncryptSSN from 'App/OpenBanking/NeonomicsEncryptSSN'
import GetIp from "App/OpenBanking/GetIp"

export default async function FetchAuthToken (user, BANK, CODE) {
   
    switch (BANK) {
      case "deutschebank":
        	return { auth_url:`https://simulator-api.db.com/gw/oidc/authorize?response_type=code&redirect_uri=${process.env.APP_URL+"add-account/deutschebank/"}&client_id=${process.env.deutschebank_client}` }
        break       

      case "rabobank":
        	return { auth_url:`https://api-sandbox.rabobank.nl/openapi/sandbox/oauth2/authorize?client_id=${process.env.rabobank_client}&response_type=code&scope=ais.balances.read%20ais.transactions.read-90days&redirect_uri=${process.env.APP_URL.slice(0, -1)}/add-account/rabobank`}
        break

      case "neonomics":
        if (CODE === "client_credentials") {
         
        	let neonomicsResponse = {}
        	let neonomicsBanks = {}
        	neonomicsResponse = await axios.post( "https://sandbox.neonomics.io/auth/realms/sandbox/protocol/openid-connect/token", 
        		Qs.stringify({
        			grant_type: "client_credentials", 
        			client_id: process.env.neonomics_client,
        			client_secret: process.env.neonomics_secret, 
        		}), {
        			headers: {
        				'Content-Type': 'application/x-www-form-urlencoded'
        			}
        		}).then( (response) => {
        			return response
  	    		}).catch((error) => {return error.response})

            if (neonomicsResponse === undefined)
                return {error:504, message:"We couldn't log in Neonomics, Please try again"}
            console.warn("1 - NEONOMICS: Getting oAuth Access Tokens", neonomicsResponse.data.token_type)
                
            let neonomicsAuthToken = neonomicsResponse.data.access_token


        	neonomicsBanks = await axios.get( "https://sandbox.neonomics.io/ics/v3/banks", 
        		{ headers: {
                    "Authorization": `Bearer ${neonomicsAuthToken}`,
                    "x-device-id": await NeonomicsUniqueId(user),
                    "Accept": `application/json`
                }}).then( (response) => { return response
  	    		}).catch((error) => {return error.response})

            if (neonomicsBanks === undefined)
                return {error:504, message:"We couldn't Fetch the available banks, Please try again"}         
            console.warn("1 - NEONOMICS: Getting Banks available", neonomicsBanks.data.length)

            console.log(JSON.stringify(neonomicsBanks.data))
        	
            return {...neonomicsResponse.data, banks: neonomicsBanks.data} 
            
        } else {
            
            CODE = JSON.parse(CODE) //VALIDATE

            let neonomicsAuthToken = await GetToken(user,"auth_token","Neonomics") 
            let responseBankSession = await axios.post( "https://sandbox.neonomics.io/ics/v3/session", 
                { 
            		bankId: CODE.id 
      	    	}, { headers: {
      	    		"Authorization": `Bearer ${neonomicsAuthToken}`,
		    		"Accept": `application/json`,
		    		"x-device-id": await NeonomicsUniqueId(user),
            	}}).then( (response) => {
       	    		return response
            	}).catch((error) => {
            		return error.response
            	})
            if (responseBankSession === undefined)
                return {error:504, message:"We couldn't Log in at"+CODE.name}
            console.warn("2 - NEONOMICS: Creating bank session id", responseBankSession.data)

            let responseAccounts = await axios.get( "https://sandbox.neonomics.io/ics/v3/accounts",
    	        { headers: {
                    "Authorization": `Bearer ${neonomicsAuthToken}`,
                    "Accept": `application/json`,
                    "x-device-id": await NeonomicsUniqueId(user),
                    "x-psu-id": CODE.name === "DNB" ? await NeonomicsEncryptSSN("31125461118") : null,
                    "x-session-id": responseBankSession.data.sessionId,
                    "x-psu-ip-address": await GetIp(),
                }}).then( (response) => {
		    		return response // should return bank acccounts OR the consent link
    	    	}).catch((error) => {
    	    		return error.response
    	    	})

            if (responseAccounts === undefined)
                return {error:504, message:"We couldn't fetch your bank accounts, please try again"}
            console.warn("2 - NEONOMICS: asking for accounts (expecting error 1426 or 1428)\n", responseAccounts.data.links[0].href)
                        

    	    if ("errorCode" in responseAccounts.data && (responseAccounts.data.errorCode == '1426' || responseAccounts.data.errorCode == '1428')) {

    	    	let responseConsent = await axios.get( responseAccounts.data.links[0].href,
    	    	    { headers: {
                        "Authorization": `Bearer ${neonomicsAuthToken}`,
                        "Accept": `application/json`,
                        "x-device-id": await NeonomicsUniqueId(user),
                        "x-psu-id": CODE.name === "DNB" ? await NeonomicsEncryptSSN("31125461118") : null,
                        "x-session-id": responseBankSession.data.sessionId,
                        "x-redirect-url": process.env.APP_URL+"add-account/"+(CODE.name.replace(" ","%20"))+"/?code=consented"
                    }}).then( (response) => {
    	    	      return response
    	    	    }).catch((error) => {return error.response})
                
                if (responseConsent === undefined)
                    return {error:504, message:"We couldn't fetch the consent link, please try again"}
                console.warn("2 - NEONOMICS: Consent Link has been delivered. Please procceed\n", responseConsent.data.links[0].href)

    	    	return {bank:CODE.name, ...responseBankSession.data, consent_url:responseConsent.data.links[0].href}
    	    }

            console.warn("X - NEONOMICS: Probably this case won't happen\n", {bank:CODE.name, ...responseBankSession.data, ...responseAccounts.data})
    	    return {bank:CODE.name, ...responseBankSession.data, ...responseAccounts.data}
        }
        break

      default:
      	return {error:400, message:"Bank not supported"}
        break
    }

}