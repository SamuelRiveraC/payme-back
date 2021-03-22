"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Schema"));
class Transactions extends Schema_1.default {
    constructor() {
        super(...arguments);
        this.tableName = 'transactions';
    }
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id").primary();
            table.string("uuid");
            table.integer('user_sender_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.integer('user_receiver_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.integer('account_sender_id').unsigned().references('id').inTable('bank_accounts').onDelete('CASCADE');
            table.integer('account_receiver_id').unsigned().references('id').inTable('bank_accounts').onDelete('CASCADE');
            table.float('amount', 16, 2).unsigned();
            table.integer('status').unsigned();
            table.timestamps(true, true);
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
exports.default = Transactions;
//# sourceMappingURL=1613243357587_transactions.js.map