"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BankAccount_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/BankAccount"));
class BankAccountsController {
    async store({ auth }) {
        const user = await auth.authenticate();
        const TestAccount = {
            user_id: user.id,
            alias: `PayMe Test Account (${user.last_name})`,
            balance: 1000.00,
            iban: `PMXX ${Date.now()}${(Math.random() * (9999999 - 999999) + 999999).toFixed()}`,
            bic: `PMXX PM ${(Math.random() * (99 - 0) + 0).toFixed()} ${(Math.random() * (999 - 0) + 0).toFixed()}`,
            primary: 'true',
            expires_at: `${new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()).toLocaleString()}`
        };
        await BankAccount_1.default.query().where('user_id', user.id).update({ primary: 'false' });
        const newAccount = await BankAccount_1.default.create(TestAccount);
        return newAccount;
    }
    async show({ auth, params }) {
        const user = await auth.authenticate();
        const account = await BankAccount_1.default.query().where('id', params.id).andWhere('user_id', user.id).firstOrFail();
        return account;
    }
    async update({ auth, params, request, response }) {
        const user = await auth.authenticate();
        const account = await BankAccount_1.default.query().where('id', params.id).andWhere('user_id', user.id).firstOrFail();
        if (request.input("primary") === "true" || request.input("primary") === "false") {
            if (request.input("primary") === "true") {
                await BankAccount_1.default.query().where('user_id', user.id).update({ primary: 'false' });
                account.primary = "true";
            }
            else if (request.input("primary") === "false") {
                account.primary = "false";
            }
            else {
                return response.status(401).send({ code: "E_BAD_REQUEST" });
            }
        }
        if (request.input("expires_at")) {
            account.expires_at = new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()).toLocaleString();
        }
        await account.save();
        return account;
    }
    async destroy({ auth, params }) {
        const user = await auth.authenticate();
        const account = await BankAccount_1.default.query().where('id', params.id).andWhere('user_id', user.id).firstOrFail();
        await account.delete();
    }
}
exports.default = BankAccountsController;
//# sourceMappingURL=BankAccountsController.js.map