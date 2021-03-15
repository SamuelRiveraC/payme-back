import Database from '@ioc:Adonis/Lucid/Database'

export default async function GetToken (user, type, name) {
    let token = await Database.query().from('api_tokens')
        .where('user_id', user.id).andWhere('type', type).andWhere('name', name)
          .orderBy('created_at', 'desc').limit(1); //Is not expireda
    if (token[0] && token[0]["token"])
        return token[0]["token"]
    return null
}


