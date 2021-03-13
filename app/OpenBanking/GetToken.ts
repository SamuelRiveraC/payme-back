import Database from '@ioc:Adonis/Lucid/Database'

export default async function GetToken (user, type, name) {
    let token = await Database.query().from('api_tokens')
        .where('user_id', user.id).andWhere('type', type).andWhere('name', name)
          .orderBy('created_at', 'desc').limit(1);
          //IS NO TEXPIRED
    return token[0]["token"]
}


