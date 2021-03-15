"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BankAccount_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/BankAccount"));
class BankAccountsController {
    async store({ auth, request }) {
        const user = await auth.authenticate();
        let bank = request.input("bank");
        let bank_accounts = request.input("bank_accounts");
        if (bank === "deutschebank" && bank_accounts.length > 0) {
            await BankAccount_1.default.query().where('user_id', user.id).update({ primary: 'false' });
            bank_accounts.forEach(async (account) => {
                await BankAccount_1.default.updateOrCreate({ iban: account.iban }, {
                    user_id: user.id,
                    alias: `${account.productDescription} (${user.last_name})`,
                    balance: account.currentBalance,
                    bic: account.bic,
                    primary: 'false',
                });
            });
        }
        if (bank === "rabobank" && bank_accounts.length > 0) {
        }
        if (bank === "payme") {
            await BankAccount_1.default.query().where('user_id', user.id).update({ primary: 'false' });
            return await BankAccount_1.default.create({
                user_id: user.id,
                alias: `PayMe Test Account (${user.last_name})`,
                balance: 1000.00,
                iban: `PMXX ${Date.now()}${(Math.random() * (9999999 - 999999) + 999999).toFixed()}`,
                bic: `PMXX PM ${(Math.random() * (99 - 0) + 0).toFixed()} ${(Math.random() * (999 - 0) + 0).toFixed()}`,
                primary: 'true',
                expires_at: `${new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()).toLocaleString()}`
            });
        }
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