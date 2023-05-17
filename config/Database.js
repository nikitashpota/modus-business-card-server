import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const modus_business_db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_LOGIN,
  process.env.DB_PASS,
  {
    host: "localhost",
    dialect: "mysql",
  }
);

try {
  await modus_business_db.authenticate();
  console.log("Соединение с БД было успешно установлено");
} catch (err) {
  console.log("Невозможно выполнить подключение к БД: ", err);
}

export default modus_business_db;
