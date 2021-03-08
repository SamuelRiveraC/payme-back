"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Route_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Route"));
Route_1.default.resource('users', 'UsersController').apiOnly().except(["index", "destroy"]);
Route_1.default.get('/users/search/:id', 'UsersController.search');
Route_1.default.get('/auth', 'UsersController.getSelfData');
Route_1.default.post('/login', 'UsersController.login');
Route_1.default.get('/logout', 'UsersController.logout');
//# sourceMappingURL=users.js.map