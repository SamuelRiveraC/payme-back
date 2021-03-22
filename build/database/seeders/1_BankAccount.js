"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Seeder_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Seeder"));
const BankAccount_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/BankAccount"));
class BankAccountSeeder extends Seeder_1.default {
    async run() {
        await BankAccount_1.default.updateOrCreateMany("iban", [
            {
                id: 1,
                user_id: 7,
                bank: "payme",
                alias: "Checking (Ozdemir)",
                balance: "1000",
                iban: 'PM00PAYMETESTACCOUNT1138',
                bic: 'DBXXRP01138',
                primary: 'true'
            },
            {
                id: 2,
                user_id: 8,
                bank: "payme",
                alias: "Checking (Ella)",
                balance: "1000",
                iban: 'PM00PAYMETESTACCOUNT2187',
                bic: 'DBXXRP02187',
                primary: 'true'
            }
        ]);
    }
}
exports.default = BankAccountSeeder;
//# sourceMappingURL=1_BankAccount.js.map