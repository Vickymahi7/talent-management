import dotenv from "dotenv";
import "reflect-metadata";
import { DataSource } from "typeorm";
import StandardMenu from "./models/StandardMenu";
import Tenant from "./models/Tenant";
import User from "./models/User";
import UserMenuPrivilege from "./models/UserMenuPrivilege";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [User, Tenant, UserMenuPrivilege, StandardMenu],
  subscribers: [],
  migrations: [],
  timezone: "Z",
});
