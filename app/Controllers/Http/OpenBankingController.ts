import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Qs from "qs"
import axios from "axios"

import GetAuthToken from 'App/OpenBanking/GetAuthToken'
import GetAccessToken from 'App/OpenBanking/GetAccessToken'
import GetBankAccounts from 'App/OpenBanking/GetBankAccounts'


export default class OpenBankingController {

  public async OAuthAuth ({auth, request}: HttpContextContract) {
    const user = await auth.authenticate()
    const bank = request.input("bank")
    const code = request.input("code")


    let AuthToken = GetAuthToken(user,bank,code)

    if ("auth_url" in AuthToken){
      return AuthToken.auth_url
    } else if ("neonomicsBanks" in AuthToken) {
      //STORE TOKEN
      return {neonomicsBanks: AuthToken.neonomicsBanks}
    } else {
      //STORE TOKEN
    }
  }

  public async OAuthAccessAndBanks ({auth, request}: HttpContextContract) {
    const user = await auth.authenticate()
    const bank = request.input("bank")
    const code = request.input("code")
    let AccessToken = GetAccessToken(user,bank,code)

    //STORE TOKEN

    let GetBankAccounts = GetBankAccounts(user,bank)

    let StoredBankAccounts = true //STORE BANK ACCOUNTS

    return StoredBankAccounts
  }
}
