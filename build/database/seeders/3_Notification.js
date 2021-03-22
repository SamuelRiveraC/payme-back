"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Seeder_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Seeder"));
const Notification_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Notification"));
class NotificationSeeder extends Seeder_1.default {
    async run() {
        await Notification_1.default.updateOrCreateMany("transaction_id", [
            {
                user_id: 7,
                transaction_id: 1,
                type: '1',
                status: '0'
            },
            {
                user_id: 6,
                transaction_id: 2,
                type: '1',
                status: '0'
            },
            {
                user_id: 6,
                transaction_id: 3,
                type: '1',
                status: '0'
            },
            {
                user_id: 7,
                transaction_id: 4,
                type: '1',
                status: '0'
            },
        ]);
    }
}
exports.default = NotificationSeeder;
//# sourceMappingURL=3_Notification.js.map