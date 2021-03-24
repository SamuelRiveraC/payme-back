"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Seeder_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Seeder"));
const User_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/User"));
class UserSeeder extends Seeder_1.default {
    async run() {
        await User_1.default.updateOrCreateMany("email", [
            {
                id: 1,
                email: 'Angela@payme.com',
                phone: '+100000001',
                password: 'secret',
                first_name: 'Angela',
                last_name: 'Deutschbank',
                profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=AG'
            },
            {
                id: 2,
                email: 'Adam@payme.com',
                phone: '+100000002',
                password: 'secret',
                first_name: 'Adam',
                last_name: 'Deutschbank',
                profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=AM'
            },
            {
                id: 3,
                email: 'Sophie@payme.com',
                phone: '+100000003',
                password: 'secret',
                first_name: 'Sophie',
                last_name: 'Rabobank',
                profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=ST'
            },
            {
                id: 4,
                email: 'Emma@payme.com',
                phone: '+100000005',
                password: 'secret',
                first_name: 'Emma',
                last_name: 'Neonomics',
                profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=JP'
            },
            {
                id: 5,
                email: 'Bram@payme.com',
                phone: '+100000006',
                password: 'secret',
                first_name: 'Bram',
                last_name: 'Neonomics',
                profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=BT'
            },
            {
                id: 6,
                email: 'Ozdemir@payme.com',
                phone: '+100000007',
                password: 'secret',
                first_name: 'Suayip',
                last_name: 'Ozdemir',
                profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=SO'
            },
            {
                id: 7,
                email: 'Ella@payme.com',
                phone: '+100000008',
                password: 'secret',
                first_name: 'Ella',
                last_name: 'PayMe',
                profile_picture: 'https://via.placeholder.com/160/29363D/EDF4FC?text=ET'
            },
        ]);
    }
}
exports.default = UserSeeder;
//# sourceMappingURL=0_User.js.map