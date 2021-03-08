import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Notification from 'App/Models/Notification'

export default class NotificationsController {
  public async index ({}: HttpContextContract) {
    const notification = await Notification.all()
    return notification
  }

  public async store ({request}: HttpContextContract) {
    const notification = await Notification.create(request.all())
    return notification
  }

  public async show ({params}: HttpContextContract) {
    const notification = await Notification.findOrFail(params.id)
    return notification
  }

  public async update ({request,params}: HttpContextContract) {
    const notification = await Notification.findOrFail(params.id)
    if (notification.status == "0") {
      notification.status = "1"
      await notification.save()
    }
    return notification 
  }

  public async destroy ({request}: HttpContextContract) {
    const notification = await Notification.findOrFail(request.input("id"))
    await notification.delete()
  } 
}
