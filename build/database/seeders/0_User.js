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
                email: 'DuPont@test.com',
                phone: '+320001111',
                password: 'secret',
                first_name: 'Jean',
                last_name: 'DuPont',
                slug: 'DuPont'
            },
            {
                email: 'Mustermann@gmail.com',
                phone: '+490001111',
                password: 'secret',
                first_name: 'Max',
                last_name: 'Mustermann',
                slug: 'Mustermann'
            },
            {
                email: 'Jansen@test.com',
                phone: '+310001111',
                password: 'secret',
                first_name: 'Jan',
                last_name: 'Jansen',
                slug: 'Jansen'
            },
            {
                email: 'Smith@test.com',
                phone: '+440001111',
                password: 'secret',
                first_name: 'John',
                last_name: 'Smith',
                slug: 'Smith'
            },
            {
                email: 'Ozdemir@test.com',
                phone: '+310002222',
                password: 'secret',
                first_name: 'Suayip',
                last_name: 'Ozdemir',
                slug: 'Ozdemir'
            }
        ]);
    }
}
exports.default = UserSeeder;
//# sourceMappingURL=0_User.js.map