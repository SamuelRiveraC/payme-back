"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const User_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/User"));
const BankAccount_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/BankAccount"));
const Transaction_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Transaction"));
const Notification_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Notification"));
const GetToken_1 = __importDefault(global[Symbol.for('ioc.use')]("App/OpenBanking/GetToken"));
class TransactionsController {
    async store({ auth, request, response }) {
        const user = await auth.authenticate();
        let newTransaction = {};
        newTransaction.amount = request.input("amount");
        let newNotification = { status: "0" };
        if (user.id == request.input("user_sender_id") || user.id == request.input("user_receiver_id")) {
            return response.status(400).send({ code: "E_SAME_USER" });
        }
        if (request.input("user_sender_id")) {
            const requestedUser = await User_1.default.findOrFail(request.input("user_sender_id"));
            newTransaction.user_sender_id = requestedUser.id;
            newTransaction.user_receiver_id = user.id;
            newTransaction.status = "0";
            newNotification.user_id = requestedUser.id;
            newNotification.type = "0";
            const transaction = await Transaction_1.default.create(newTransaction);
            newNotification.transaction_id = transaction.id;
            await Notification_1.default.create(newNotification);
            await transaction.preload('sender');
            await transaction.preload('receiver');
            return transaction;
        }
        else if (request.input("user_receiver_id")) {
            newTransaction.user_receiver_id = request.input("user_receiver_id");
            newTransaction.user_sender_id = user.id;
            newTransaction.status = "0";
            newNotification.user_id = request.input("user_receiver_id");
            newNotification.type = "1";
            let senderAccount = await BankAccount_1.default.query().where('user_id', user.id).andWhere('primary', "true").first();
            if (senderAccount == null) {
                return response.status(401).send({ code: "E_SENDER_NO_BANK_ACCOUNT" });
            }
            let receiverAccount = await BankAccount_1.default.query().where('user_id', request.input("user_receiver_id")).andWhere('primary', "true").first();
            if (receiverAccount == null) {
                return response.status(401).send({ code: "E_RECEIVER_NO_BANK_ACCOUNT" });
            }
            if (senderAccount.balance < newTransaction.amount) {
                return response.status(401).send({ code: "E_INSUFFICIENT_FUNDS" });
            }
            senderAccount.balance = senderAccount.balance - newTransaction.amount;
            receiverAccount.balance = receiverAccount.balance + newTransaction.amount;
            const transaction = await Transaction_1.default.create(newTransaction);
            await transaction.preload('sender');
            await transaction.preload('receiver');
            let openBanking = {};
            if (request.input("bank") === "payme") {
                openBanking = { status: 200 };
            }
            if (request.input("bank") === "deutschebank") {
                let DBToken = await GetToken_1.default(user, "access_token", "deutschebank");
                console.log(DBToken);
                openBanking = await axios_1.default.post("https://simulator-api.db.com/gw/dbapi/paymentInitiation/payments/v1/instantSepaCreditTransfers", {
                    "debtorAccount": {
                        "iban": senderAccount.iban, "currencyCode": "EUR"
                    },
                    "instructedAmount": {
                        "amount": transaction.amount, "currencyCode": "EUR"
                    },
                    "creditorName": transaction.receiver.first_name + " " + transaction.receiver.last_name,
                    "creditorAccount": {
                        "iban": receiverAccount.iban, "currencyCode": "EUR"
                    }
                }, { headers: { Authorization: DBToken, otp: request.input("otp"), 'idempotency-id': transaction.uuid, } }).then(async (response) => {
                    if (response.status === 200 || response.status === 201) {
                        return response;
                    }
                }).catch((error) => { return error.response; });
            }
            transaction.status = "1";
            await transaction.save();
            await senderAccount.save();
            await receiverAccount.save();
            newNotification.transaction_id = transaction.id;
            await Notification_1.default.create(newNotification);
            return transaction;
        }
        return response.status(400).send({ code: "E_BAD_REQUEST" });
    }
    async update({ auth, params, response }) {
        const transaction = await Transaction_1.default.findOrFail(params.id);
        const user = await auth.authenticate();
        if (transaction.status == "1") {
            return response.status(401).send({ code: "E_TRANSACTION_PAID" });
        }
        else if (transaction.status == "2") {
            return response.status(401).send({ code: "E_TRANSACTION_CANCELLED" });
        }
        if (user.id == transaction.user_sender_id) {
            let senderAccount = await BankAccount_1.default.query().where('user_id', user.id).andWhere('primary', "true").first();
            if (senderAccount == null) {
                return response.status(401).send({ code: "E_SENDER_NO_BANK_ACCOUNT" });
            }
            let receiverAccount = await BankAccount_1.default.query().where('user_id', transaction.user_receiver_id).andWhere('primary', "true").first();
            if (receiverAccount == null) {
                return response.status(401).send({ code: "E_RECEIVER_NO_BANK_ACCOUNT" });
            }
            if (senderAccount.balance < transaction.amount) {
                return response.status(401).send({ code: "E_INSUFFICIENT_FUNDS" });
            }
            senderAccount.balance = senderAccount.balance - transaction.amount;
            receiverAccount.balance = receiverAccount.balance + transaction.amount;
            transaction.status = "1";
            if (request.input("bank") === "payme") {
                await senderAccount.save();
                await receiverAccount.save();
                newNotification.transaction_id = transaction.id;
                await Notification_1.default.create(newNotification);
                await transaction.preload('sender');
                await transaction.preload('receiver');
                return transaction;
            }
            if (request.input("bank") === "deutschebank") {
            }
            await transaction.save();
            await senderAccount.save();
            await receiverAccount.save();
            await Notification_1.default.create({
                user_id: transaction.user_receiver_id,
                transaction_id: transaction.id,
                type: '1',
                status: '0'
            });
            let requesterNotification = await Notification_1.default.query().where('transaction_id', transaction.id).andWhere('user_id', transaction.user_sender_id).firstOrFail();
            requesterNotification.status = "1";
            requesterNotification.save();
            await transaction.preload('sender');
            await transaction.preload('receiver');
            return transaction;
        }
        else if (user.id == transaction.user_receiver_id) {
            transaction.status = "2";
        }
        return response.status(401).send({ code: "E_USER_WRONG_TRANSACTION_ID" });
    }
}
exports.default = TransactionsController;
//# sourceMappingURL=TransactionsController.js.map