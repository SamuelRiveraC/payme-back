"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Env_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Env"));
exports.default = Env_1.default.rules({
    HOST: Env_1.default.schema.string({ format: 'host' }),
    PORT: Env_1.default.schema.number(),
    APP_KEY: Env_1.default.schema.string(),
    APP_NAME: Env_1.default.schema.string(),
    NODE_ENV: Env_1.default.schema.enum(['development', 'production', 'testing']),
    rabobank_client: Env_1.default.schema.string(),
    rabobank_secret: Env_1.default.schema.string(),
    deutschebank_client: Env_1.default.schema.string(),
    deutschebank_secret: Env_1.default.schema.string(),
    neonomics_client: Env_1.default.schema.string(),
    neonomics_secret: Env_1.default.schema.string(),
});
//# sourceMappingURL=env.js.map