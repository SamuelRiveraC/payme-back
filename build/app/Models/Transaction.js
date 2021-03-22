"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
const Orm_1 = global[Symbol.for('ioc.use')]("Adonis/Lucid/Orm");
const User_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/User"));
const BankAccount_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/BankAccount"));
const uuid_1 = require("uuid");
class Transaction extends Orm_1.BaseModel {
    static async createUUID(model) {
        model.uuid = uuid_1.v4();
    }
}
__decorate([
    Orm_1.column({ isPrimary: true }),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", String)
], Transaction.prototype, "uuid", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", Number)
], Transaction.prototype, "user_sender_id", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", Number)
], Transaction.prototype, "user_receiver_id", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", Number)
], Transaction.prototype, "account_sender_id", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", Number)
], Transaction.prototype, "account_receiver_id", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    Orm_1.belongsTo(() => User_1.default, { localKey: 'id', foreignKey: 'user_sender_id' }),
    __metadata("design:type", Object)
], Transaction.prototype, "sender", void 0);
__decorate([
    Orm_1.belongsTo(() => User_1.default, { localKey: 'id', foreignKey: 'user_receiver_id' }),
    __metadata("design:type", Object)
], Transaction.prototype, "receiver", void 0);
__decorate([
    Orm_1.belongsTo(() => BankAccount_1.default, { localKey: 'id', foreignKey: 'account_sender_id' }),
    __metadata("design:type", Object)
], Transaction.prototype, "senderAccount", void 0);
__decorate([
    Orm_1.belongsTo(() => BankAccount_1.default, { localKey: 'id', foreignKey: 'account_receiver_id' }),
    __metadata("design:type", Object)
], Transaction.prototype, "receiverAccount", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true }),
    __metadata("design:type", luxon_1.DateTime)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", luxon_1.DateTime)
], Transaction.prototype, "updatedAt", void 0);
__decorate([
    Orm_1.beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Transaction]),
    __metadata("design:returntype", Promise)
], Transaction, "createUUID", null);
exports.default = Transaction;
//# sourceMappingURL=Transaction.js.map