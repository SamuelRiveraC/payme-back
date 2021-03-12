import Qs from "qs"
import axios from "axios"
export default async function GetAuthToken (user, BANK, CODE) {
    
    switch (BANK) {
      case "deutschebank":
        return { auth_url:`https://simulator-api.db.com/gw/oidc/authorize?response_type=code&redirect_uri=${process.env.APP_URL+"add-account/deutschebank"}&client_id=${process.env.deutschebank_client}` }
        break;       

      case "rabobank":
        return { auth_url:`https://api-sandbox.rabobank.nl/openapi/sandbox/oauth2/authorize?client_id=${process.env.rabobank_client}&response_type=code&scope=ais.balances.read%20ais.transactions.read-90days&redirect_uri=${process.env.APP_URL.slice(0, -1)}/add-account/rabobank`}
        break;

      case "neonomics":
        if (CODE === "client_credentials") {
        	let neonomicsResponse = { banks:{} }
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
        	neonomicsBanks = {}
        	return {...neonomicsResponse, neonomicsBanks:neonomicsBanks}
        } else if (CODE === "client_bank_credentials") {
        	let response = await axios.post( "https://sandbox.neonomics.io/ics/v3/session", 
        		{ 
        			grant_type: "client_credentials",
        			bankId: BANK 
      			}, { 
      				headers: {
      					Authorization: `Bearer ${accessToken}`,
						Accept: `application/json`,
						"x-device-id": "x-device-id"
        		}}).then( (response) => {
					if (response.status == 200)
        				return response
        			else 
        		  		throw new Error("Error");
        		}).catch((error) => {
        			if (error.response.data.errorCode == 1426 )
            			return error.response
            		else
            			return error.response
        		});

        	// CHECK IF CONSENT
        	if (response.status === 1492 || "errorCode" in response.data || response.data.errorCode == 1426) {
        		

        	}
        	//THEN RETURN UR2
        	L

        }
        break;

      default:
      	return "Not a supported Bank"
        break;
    }

}