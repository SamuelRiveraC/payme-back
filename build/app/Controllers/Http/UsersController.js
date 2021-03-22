"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/User"));
class UsersController {
    async search({ auth, params }) {
        const user = await auth.authenticate();
        const users = await User_1.default.query()
            .where(function (user) {
            user.where('email', 'like', `%${params.id}%`)
                .orWhere('phone', 'like', `%${params.id}%`)
                .orWhere('first_name', 'like', `%${params.id}%`)
                .orWhere('last_name', 'like', `%${params.id}%`);
        })
            .andWhereNot('id', user.id)
            .andWhereHas('bankAccounts', (query) => {
            query.where('primary', "true");
        })
            .preload("bankAccounts");
        return users;
    }
    async store({ request, auth }) {
        const savePayload = request.all();
        savePayload.profile_picture = "https://via.placeholder.com/160/29363D/EDF4FC?text=" + request.input('first_name')[0] + request.input('last_name')[0];
        const user = await User_1.default.create(savePayload);
        const token = await auth.use('api').attempt(request.input('email'), request.input('password'));
        return { ...token.toJSON(), user };
    }
    async show({ auth, params, response }) {
        const user = await User_1.default.findByOrFail('slug', params.id);
        const requestUser = await auth.authenticate();
        if (user.id === requestUser.id) {
            return response.status(401).send({ code: "E_ROW_SAME_USER" });
        }
        return user;
    }
    async update({ request, params }) {
        const user = await User_1.default.findOrFail(params.id);
        if (request.input("first_name"))
            user.first_name = request.input("first_name");
        if (request.input("last_name"))
            user.last_name = request.input("last_name");
        if (request.input("password"))
            user.last_name = request.input("password");
        if (request.input("phone"))
            user.first_name = request.input("phone");
        if (request.input("email"))
            user.last_name = request.input("email");
        await user.save();
        return user;
    }
    async login({ request, auth }) {
        const emailOrPhone = request.input('emailOrPhone');
        const password = request.input('password');
        const token = await auth.use('api').attempt(emailOrPhone, password);
        let user = await User_1.default.findOrFail(auth.user.id);
        await user.preload('bankAccounts');
        let primaryAccount = user.bankAccounts.find((account) => {
            return account.primary === "true";
        });
        if (primaryAccount !== undefined) {
            await primaryAccount.preload('transactionsSent', (query) => {
                query.where('status', 1);
                query.preload('sender');
                query.preload('receiver');
            });
            await primaryAccount.preload('transactionsReceived', (query) => {
                query.where('status', 1);
                query.preload('sender');
                query.preload('receiver');
            });
        }
        await user.preload('notifications', (query) => {
            query.where("status", 0);
            query.preload('transaction', (query) => {
                query.preload('sender');
                query.preload('receiver');
            });
        });
        return { ...token.toJSON(), user };
    }
    async logout({ auth }) {
        await auth.logout();
    }
}
exports.default = UsersController;
//# sourceMappingURL=UsersController.js.map