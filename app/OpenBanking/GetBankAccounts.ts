export default async function GetBankAccounts () {
    return "bankAccounts"

    /*
    	axios.get( "https://sandbox.neonomics.io/ics/v3/accounts",
    	  { headers: { Authorization: `Bearer ${accessToken}`,
    	    Accept: `application/json`, "x-device-id": CODE,
    	    "x-psu-ip-address":"", "x-session-id": response.sessionId
	
    	}}).then( (responseAccounts) => {
    	  // if consent already also this is way there should be an specific function to create accs
    	  
	
	
    	}).catch((error) => {
    	  if (error.response.data.errorCode === "1426" ) {
    	     axios.get( error.response.data.links[0].href,
    	      { headers: { Authorization: `Bearer ${accessToken}`,
    	        Accept: `application/json`, "x-device-id": CODE,
    	        "x-psu-ip-address":"", "x-redirect-url": "http://localhost:3000/"+"add-account/neonomics?code=consented" //process.env.REACT_APP_APP_URL+"add-account/rabobank"
    	    }}).then( (responseConsent) => {
    	      return responseConsent.data.links.href
    	    }).catch((error) => {throw new Error("Error")});
    	  } else {
    	    throw new Error("Error")
    	  }
    	});
	*/

}