const dbConfig = require("../config/dbConfig.js");
const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
  dialectOptions: {
    options: {
      useUTC: false, // for reading from database
      timezone: "-03:00",
    },
  },
  useUTC: false,
  timezone: "-03:00", // for writing to database
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
