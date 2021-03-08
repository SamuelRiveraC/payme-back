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
const Hash_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Hash"));
const Orm_1 = global[Symbol.for('ioc.use')]("Adonis/Lucid/Orm");
const Database_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Database"));
const BankAccount_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/BankAccount"));
const Transaction_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Transaction"));
const Notification_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Notification"));
class User extends Orm_1.BaseModel {
    static async hashPassword(user) {
        if (user.$dirty.password) {
            user.password = await Hash_1.default.make(user.password);
        }
    }
    static async Slug(user) {
        const total = await Database_1.default.query().count('* as total').from('users');
        user.slug = user.email.split('@')[0] + total[0]["total"];
    }
    static async Profile_picture(user) {
        const profile_picture = "https://via.placeholder.com/160/29363D/EDF4FC?text=" + user.first_name[0] + user.last_name[0];
        if (!user.$dirty.profile_picture) {
            user.profile_picture = profile_picture;
        }
    }
}
__decorate([
    Orm_1.column({ isPrimary: true }),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", String)
], User.prototype, "first_name", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", String)
], User.prototype, "last_name", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", String)
], User.prototype, "profile_picture", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", String)
], User.prototype, "slug", void 0);
__decorate([
    Orm_1.column({ serializeAs: null }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    Orm_1.column(),
    __metadata("design:type", String)
], User.prototype, "rememberMeToken", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true }),
    __metadata("design:type", luxon_1.DateTime)
], User.prototype, "createdAt", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", luxon_1.DateTime)
], User.prototype, "updatedAt", void 0);
__decorate([
    Orm_1.hasMany(() => BankAccount_1.default, { foreignKey: 'user_id', }),
    __metadata("design:type", Object)
], User.prototype, "bankAccounts", void 0);
__decorate([
    Orm_1.hasMany(() => Transaction_1.default, { foreignKey: 'user_sender_id', }),
    __metadata("design:type", Object)
], User.prototype, "transactionsSent", void 0);
__decorate([
    Orm_1.hasMany(() => Transaction_1.default, { foreignKey: 'user_receiver_id', }),
    __metadata("design:type", Object)
], User.prototype, "transactionsReceived", void 0);
__decorate([
    Orm_1.hasMany(() => Notification_1.default, { foreignKey: 'user_id', }),
    __metadata("design:type", Object)
], User.prototype, "notifications", void 0);
__decorate([
    Orm_1.beforeSave(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], User, "hashPassword", null);
__decorate([
    Orm_1.beforeSave(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], User, "Slug", null);
__decorate([
    Orm_1.beforeSave(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], User, "Profile_picture", null);
exports.default = User;
//# sourceMappingURL=User.js.map