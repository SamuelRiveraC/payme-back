import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Qs from "qs"
import axios from "axios"

export default class OpenBankingController {

  public async oauth ({auth, request}: HttpContextContract) {

    // const user = await auth.authenticate()

    switch (request.input("bank")) {
      case "deutschebank":
        return await axios.post( "https://simulator-api.db.com/gw/oidc/token", 
        Qs.stringify({
          grant_type: 'authorization_code',
          code: request.input("code"),
          redirect_uri: "http://localhost:3000/add-account/deutschebank/"//process.env.APP_URL+"add-account/deutschebank/"
        }),
        { headers: { 
            Authorization: `Basic ${Buffer.from(process.env.deutschebank_client+":"+process.env.deutschebank_secret, 'utf-8').toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            accept: 'application/json',
        } } ).then( (response) => { 
        	if (response.status === 200)
        		return response
        	else 
            	throw new Error("Error");
		} ) .catch((error) => {return error})
        break;
        
      case "rabobank":
        return await axios.post( "https://api-sandbox.rabobank.nl/openapi/sandbox/oauth2/token", 
        Qs.stringify({
          grant_type: 'authorization_code',
          code: request.input("code"),
          redirect_uri: "http://localhost:3000/add-account/rabobank" //process.env.REACT_APP_APP_URL+"add-account/rabobank"
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
        // code...
        break;
      default:
        // code...
        break;

    }


  }

}
