import "reflect-metadata";
import { DataSource } from "typeorm";
import User from "./models/User";
import Tenant from "./models/Tenant";
import dotenv from "dotenv";
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
  entities: [User, Tenant],
  subscribers: [],
  migrations: [],
});
