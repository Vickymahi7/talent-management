import "reflect-metadata";
import { DataSource } from "typeorm";
import User from "./models/User";
import Tenant from "./models/Tenant";
import dotenv from "dotenv";
import { HttpInternalServerError } from "./utils/errors";
dotenv.config();

const AppDataSource = new DataSource({
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

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!")
  })
  .catch((err) => {
    console.error(err)
    throw new HttpInternalServerError(`Something went wrong!`);
  });

export const db = AppDataSource.manager;
