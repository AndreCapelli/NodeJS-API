const dbConfig = require("../config_banco/strcon.js");
const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");

/*
  Chamada da configuração sendo feito em config/db.config.js
 */
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

//Teste conexão - authenticate já gera um select 1+1
try {
  sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;

//select de teste retornado em json
/*sequelize
  .query("SELECT * FROM CAMPANHAS  ", {
    type: QueryTypes.SELECT,
  })
  .then((data) => {
    if (!data) {
      console.log("Não encontrado");
    } else {
      console.log(data[0]);
    }
  })
  .catch((err) => {});*/
