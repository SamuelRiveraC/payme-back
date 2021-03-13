import Qs from "qs"
import axios from "axios"
import GetToken from "App/OpenBanking/GetToken"
const IPADDRESS = "109.74.179.3" //"127.0.0.0"
const DBN_SSN_ENCRYPTED = "ARxbvsVFZnYiYrkVCDOn1AE0EY955HQVMZwSOdV0eSg7QQ2kzfVIlY7Hr/D3"

export default async function FetchAuthToken (user, BANK, CODE) {
   
    switch (BANK) {
      case "deutschebank":
        	return { auth_url:`https://simulator-api.db.com/gw/oidc/authorize?response_type=code&redirect_uri=${process.env.APP_URL+"add-account/deutschebank/"}&client_id=${process.env.deutschebank_client}` }
        break;       

      case "rabobank":
        	return { auth_url:`https://api-sandbox.rabobank.nl/openapi/sandbox/oauth2/authorize?client_id=${process.env.rabobank_client}&response_type=code&scope=ais.balances.read%20ais.transactions.read-90days&redirect_uri=${process.env.APP_URL.slice(0, -1)}/add-account/rabobank`}
        break;

      case "neonomics":
        if (CODE === "client_credentials") {
        	console.warn("FIRST NEONOMICS")
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
	    			if (response.status === 200)
        				return response.data
        			else 
        		  		throw new Error("Error");
  	    		}).catch((error) => {return error});
        	neonomicsBanks = await axios.get( "https://sandbox.neonomics.io/ics/v3/banks", 
        		{
        			headers: {
						Authorization: "Bearer "+neonomicsResponse.accessToken,
        				Accept: "application/json",
        				"x-device-id": "PayMe-"+user.id,
        			}
        		}).then( (response) => {
	    			if (response.status === 200)
        				return response.data
        			else 
        		  		throw new Error("Error");
  	    		}).catch((error) => {return error});
        	return {...neonomicsResponse, banks:neonomicsBanks} 
        } 
        /*
        else if (CODE === "consented") {  

        	let neonomicsAuthToken = await GetToken(user,"auth_token","Neonomics") 
        	let neonomicsSessionId = await GetToken(user,"auth_token","Neonomics") 

        	let responseAccounts = await axios.get( "https://sandbox.neonomics.io/ics/v3/accounts",
    		  { headers: { Authorization: `Bearer ${neonomicsAuthToken}`,
    		    Accept: `application/json`, "x-device-id": "PayMe-"+user.id,
    		    "x-psu-ip-address":IPADDRESS, "x-session-id": neonomicsSessionId
				, "x-psu-id": DBN_SSN_ENCRYPTED
    			}}).then( (response) => {
					return response.data
    			}).catch((error) => {
    				return error.response.data
    			});
    		return responseAccounts

        }
        */ 
        else {
        	//Validate
        	CODE = JSON.parse(CODE)

        	let neonomicsAuthToken = await GetToken(user,"auth_token","Neonomics") 
        	let responseBankSession = await axios.post( "https://sandbox.neonomics.io/ics/v3/session", 
        		{ 
        			bankId: CODE.id 
      			}, { 
      				headers: {
      					Authorization: `Bearer ${neonomicsAuthToken}`,
						Accept: `application/json`,
						"x-device-id": "PayMe-"+user.id
						, "x-psu-id": DBN_SSN_ENCRYPTED
        		}}).then( (response) => {
       				return response.data
        		}).catch((error) => {
        			return error.response.data
        		});
        	
        	let responseAccounts = await axios.get( "https://sandbox.neonomics.io/ics/v3/accounts",
    		  { headers: { Authorization: `Bearer ${neonomicsAuthToken}`,
    		    Accept: `application/json`, "x-device-id": "PayMe-"+user.id,
    		    "x-psu-ip-address":IPADDRESS, "x-session-id": responseBankSession.sessionId
				, "x-psu-id": DBN_SSN_ENCRYPTED
    			}}).then( (response) => {
					return response.data // should return bank acccounts OR the consent link
    			}).catch((error) => {
    				return error.response.data
    			});

            console.info(responseAccounts)


    		if ("errorCode" in responseAccounts && responseAccounts.errorCode == '1426') {

        		console.warn("THIRD NEONOMICS", "errorCode" in responseAccounts, responseAccounts.errorCode == '1426')

    			let responseConsent = await axios.get( responseAccounts.links[0].href,
    			    { headers: { Authorization: `Bearer ${neonomicsAuthToken}`,
    			        Accept: `application/json`, "x-device-id": "PayMe-"+user.id,
    			        "x-psu-ip-address":IPADDRESS, "x-redirect-url": 
    			        process.env.APP_URL+"add-account/"+CODE.name+"?code=consented"
                        , "x-psu-id": DBN_SSN_ENCRYPTED
    			        //process.env.APP_URL+"add-account/rabobank"
    			    }}).then( (response) => {
    			      return response.data
    			    }).catch((error) => {return error.response.data});

                console.warn("FINAL NEONOMICS",responseConsent)

    			return {bank:CODE.name, ...responseBankSession, consent_url:responseConsent.links[0].href}
    		}
   			//console.log(119,responseAccounts)
    		return {bank:CODE.name, ...responseBankSession, ...responseAccounts}








        }
        break;

      default:
      	return "Not a supported Bank"
        break;
    }

}