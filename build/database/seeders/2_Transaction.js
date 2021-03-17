"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Seeder_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Seeder"));
const Transaction_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Transaction"));
class TransactionSeeder extends Seeder_1.default {
    async run() {
        await Transaction_1.default.updateOrCreateMany("id", [
            {
                id: 1,
                user_sender_id: 7,
                user_receiver_id: 8,
                amount: 178.1,
                status: '1'
            },
            {
                id: 2,
                user_sender_id: 8,
                user_receiver_id: 7,
                amount: 287.2,
                status: '1'
            },
            {
                id: 3,
                user_sender_id: 8,
                user_receiver_id: 7,
                amount: 387.3,
                status: '1'
            },
            {
                id: 4,
                user_sender_id: 7,
                user_receiver_id: 8,
                amount: 478.4,
                status: '1'
            }
        ]);
    }
}
exports.default = TransactionSeeder;
//# sourceMappingURL=2_Transaction.js.map