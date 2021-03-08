"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Schema"));
class BankAccounts extends Schema_1.default {
    constructor() {
        super(...arguments);
        this.tableName = 'bank_accounts';
    }
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('alias').notNullable();
            table.string('iban').notNullable();
            table.string('bic').notNullable();
            table.string('primary').notNullable();
            table.float('balance').unsigned();
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.timestamps(true, true);
            table.timestamp('expires_at', { useTz: true }).nullable();
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
exports.default = BankAccounts;
//# sourceMappingURL=1613243343697_bank_accounts.js.map