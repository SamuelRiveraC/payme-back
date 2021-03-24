"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Notification"));
class NotificationsController {
    async index({}) {
        const notification = await Notification_1.default.all();
        return notification;
    }
    async store({ request }) {
        const notification = await Notification_1.default.create(request.all());
        return notification;
    }
    async show({ params }) {
        const notification = await Notification_1.default.findOrFail(params.id);
        return notification;
    }
    async update({ request, params }) {
        const notification = await Notification_1.default.findOrFail(params.id);
        if (notification.status == "0") {
            notification.status = "1";
            await notification.save();
        }
        return notification;
    }
    async clearNotifications({ auth }) {
        const user = await auth.authenticate();
        await Notification_1.default.query().where('user_id', user.id).update({ status: '1' });
        return true;
    }
    async destroy({ request }) {
        const notification = await Notification_1.default.findOrFail(request.input("id"));
        await notification.delete();
    }
}
exports.default = NotificationsController;
//# sourceMappingURL=NotificationsController.js.map