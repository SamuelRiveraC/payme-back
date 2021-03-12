export default class OpenBankingController {

  public async oauth ({auth, request}: HttpContextContract) {

    // const user = await auth.authenticate()

    switch (request.input("bank")) {
      case "deutschebank":
        return await axios.post( "https://simulator-api.db.com/gw/oidc/token", 
        Qs.stringify({
          grant_type: 'authorization_code',
          code: request.input("code"),
          redirect_uri: "http://localhost:3000/"+"add-account/deutschebank/"//process.env.APP_URL+"add-account/deutschebank/"
        }),
        { headers: { 
            Authorization: `Basic ${Buffer.from(process.env.deutschebank_client+":"+process.env.deutschebank_secret, 'utf-8').toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            accept: 'application/json',
        } } ).then( (response) => { 
        	if (response.status === 200) {

            // Create session
            // Store accounts







          }
        	else 
            	throw new Error("Error");
		    } ) .catch((error) => {return error})
        break;       
      case "rabobank":
        return await axios.post( "https://api-sandbox.rabobank.nl/openapi/sandbox/oauth2/token", 
        Qs.stringify({
          grant_type: 'authorization_code',
          code: request.input("code"),
          redirect_uri: "http://localhost:3000/"+"add-account/rabobank" //process.env.REACT_APP_APP_URL+"add-account/rabobank"
        }),
        { headers: { 
            Authorization: `Basic ${Buffer.from(process.env.rabobank_client+":"+process.env.rabobank_secret, 'utf-8').toString('base64')}`,
            'content-type': 'application/x-www-form-urlencoded',
            accept: 'application/json',
        } } ).then( (response) => { 
          console.log(response.data)
        	if (response.status === 200)
        		return response
        	else 
            	throw new Error("Error");
		    } ) .catch((error) => {console.log(error.response.data);return error})

        break;
      case "neonomics":
        if (request.input("code") === "neonomics") {

          axios.post( "https://sandbox.neonomics.io/auth/realms/sandbox/protocol/openid-connect/token", 
          Qs.stringify({ grant_type: "client_credentials", 
            client_id: process.env.neonomics_client, client_secret: process.env.neonomics_secret, 
          }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }})
          .then( (responseToken) => {

            //Log the user & Return banks
            /*
              {
                  "access_token": "<ACCESS_TOKEN>",
                  "expires_in": 3600,
                  "refresh_expires_in": 7200,
                  "refresh_token": "<REFRESH_TOKEN>",
                  "token_type": "bearer",
                  "session_state": "eed85c80-4bd3-4c54-acb6-326075f53070"
              }
            */

            axios.get( "https://sandbox.neonomics.io/ics/v3/banks",
              { headers: { Authorization: `Bearer ${responseToken.data.access_token}`,
                Accept: `application/json`, "x-device-id": request.input("code"),
            }}).then( (responseBanks) => {
              


            }).catch((error) => {throw new Error("Error")});
          }).catch((error) => {throw new Error("Error")});

        } else if (request.input("code") === "consented" ) { //&& availableSessionID

          axios.get( "https://sandbox.neonomics.io/ics/v3/accounts",
              { headers: { Authorization: `Bearer ${accessToken}`,
                Accept: `application/json`, "x-device-id": request.input("code"),
                "x-psu-ip-address":"", "x-session-id": "sessionId"

            }}).then( (responseAccounts) => {
              // if consent already also this is way there should be an specific function to create accs



            }).catch((error) => {
              if (error.response.data.errorCode === "1426" )
                throw new Error("Are you trying to cheat?")
              else
                throw new Error("Error")
            });
        } else {
          //store bank session id then get the accounts - CONSENT SHOULD APPEAR
          let accessToken = ""
          let bankId = request.input("code")

          axios.post( "https://sandbox.neonomics.io/ics/v3/session", 
          { grant_type: "client_credentials", bankId: bankId },
          { headers: { Authorization: `Bearer ${accessToken}`,
            Accept: `application/json`, "x-device-id": "x-device-id"
          }}).then( (responseSessionBank) => {

             // Store session ~~again~~ and get the accounts at last responseSessionBank.sessionId

            axios.get( "https://sandbox.neonomics.io/ics/v3/accounts",
              { headers: { Authorization: `Bearer ${accessToken}`,
                Accept: `application/json`, "x-device-id": request.input("code"),
                "x-psu-ip-address":"", "x-session-id": responseSessionBank.sessionId

            }}).then( (responseAccounts) => {
              // if consent already also this is way there should be an specific function to create accs
              


            }).catch((error) => {
              if (error.response.data.errorCode === "1426" ) {
                 axios.get( error.response.data.links[0].href,
                  { headers: { Authorization: `Bearer ${accessToken}`,
                    Accept: `application/json`, "x-device-id": request.input("code"),
                    "x-psu-ip-address":"", "x-redirect-url": "http://localhost:3000/"+"add-account/neonomics?code=consented" //process.env.REACT_APP_APP_URL+"add-account/rabobank"
                }}).then( (responseConsent) => {
                  return responseConsent.data.links.href
                }).catch((error) => {throw new Error("Error")});
              } else {
                throw new Error("Error")
              }
            });

          }).catch((error) => {throw new Error("Error")});
        }
        break;
      default:
        // code...
        break;
    }


  }

}