"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = __importDefault(require("./models/User"));
const Tenant_1 = __importDefault(require("./models/Tenant"));
const AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
    entities: [User_1.default, Tenant_1.default],
    subscribers: [],
    migrations: [],
});
AppDataSource.initialize();
exports.db = AppDataSource.manager;
