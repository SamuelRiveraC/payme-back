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
                user_id: "1",
                alias: "Checking (DuPont)",
                balance: "1000",
                iban: 'FR0150000000000000000000',
                bic: 'DBXX FR 00 000',
                primary: 'true'
            },
            {
                user_id: "2",
                alias: "Checking (Mustermann)",
                balance: "1000",
                iban: 'DE0250000000000000000000',
                bic: 'DBXX DE 00 000',
                primary: 'true'
            },
            {
                user_id: "3",
                alias: "Checking (Jansen)",
                balance: "1000",
                iban: 'NL0350000000000000000000',
                bic: 'RBXX NL 00 000',
                primary: 'true'
            },
            {
                user_id: "4",
                alias: "Checking (Smith)",
                balance: "1000",
                iban: 'UK0450000000000000000000',
                bic: 'RVXX UK 00 000',
                primary: 'true'
            },
            {
                user_id: "4",
                alias: "Savings (Smith)",
                balance: "10000",
                iban: 'UK0400000000000000001111',
                bic: 'RVXX UK 00 000',
                primary: 'false'
            },
            {
                user_id: "5",
                alias: "Checking (Ozdemir)",
                balance: "10000",
                iban: 'NL0150000000000000000000',
                bic: 'RBXX NL 00 000',
                primary: 'true'
            },
        ]);
    }
}
exports.default = BankAccountSeeder;
//# sourceMappingURL=1_BankAccount.js.map