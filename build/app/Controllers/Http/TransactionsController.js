"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Transaction_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Transaction"));
class TransactionsController {
    async show({ auth, request }) {
        await auth.authenticate();
        let transaction = (await Transaction_1.default.findOrFail(request.input("transaction")));
        await transaction.preload('sender', query => query.preload("bankAccounts"));
        await transaction.preload('receiver', query => query.preload("bankAccounts"));
        return transaction;
    }
}
exports.default = TransactionsController;
//# sourceMappingURL=TransactionsController.js.map