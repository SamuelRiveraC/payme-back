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
                user_id: '2',
                transaction_id: 1,
                type: '1',
                status: '0'
            },
            {
                user_id: '3',
                transaction_id: 2,
                type: '1',
                status: '0'
            },
            {
                user_id: '4',
                transaction_id: 3,
                type: '1',
                status: '0'
            },
            {
                user_id: '5',
                transaction_id: 4,
                type: '1',
                status: '0'
            },
            {
                user_id: '1',
                transaction_id: 5,
                type: '1',
                status: '0'
            },
            {
                user_id: '2',
                transaction_id: 6,
                type: '1',
                status: '0'
            },
            {
                user_id: '3',
                transaction_id: 7,
                type: '1',
                status: '0'
            },
            {
                user_id: '5',
                transaction_id: 8,
                type: '1',
                status: '0'
            },
            {
                user_id: '2',
                transaction_id: 9,
                type: '1',
                status: '0'
            },
            {
                user_id: '4',
                transaction_id: 10,
                type: '1',
                status: '0'
            },
            {
                user_id: '1',
                transaction_id: 11,
                type: '0',
                status: '0'
            },
            {
                user_id: '1',
                transaction_id: 12,
                type: '0',
                status: '0'
            },
            {
                user_id: '1',
                transaction_id: 13,
                type: '0',
                status: '0'
            },
        ]);
    }
}
exports.default = NotificationSeeder;
//# sourceMappingURL=3_Notification.js.map