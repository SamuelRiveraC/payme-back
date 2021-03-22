"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Route_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Route"));
Route_1.default.resource('users', 'UsersController').apiOnly().except(["index", "destroy"]);
Route_1.default.get('/users/search/:id', 'UsersController.search');
Route_1.default.post('/login', 'UsersController.login');
Route_1.default.get('/logout', 'UsersController.logout');
Route_1.default.resource('transactions', 'TransactionsController').apiOnly().except(['index', 'show', 'destroy']);
Route_1.default.resource('bank_accounts', 'BankAccountsController').apiOnly().except(['index']);
Route_1.default.resource('notifications', 'NotificationsController').apiOnly().only(['update']);
Route_1.default.post('/oauth', 'OpenBankingController.OAuthAuth');
Route_1.default.post('/oauth-bank', 'OpenBankingController.OAuthAccessAndBanks');
Route_1.default.post('/oauth-transactions', 'OpenBankingController.OAuthTransactions');
Route_1.default.get('/refresh-tokens', 'RefreshController.refreshTokens');
Route_1.default.get('/auth', 'RefreshController.getSelfData');
Route_1.default.get('/fetch-notifications', 'RefreshController.fetchNotifications');
Route_1.default.get('/fetch-banks', 'RefreshController.fetchBanks');
Route_1.default.get('/fetch-transactions', 'RefreshController.fetchTransactions');
Route_1.default.get('/', 'OpenBankingController.urgent');
//# sourceMappingURL=routes.js.map