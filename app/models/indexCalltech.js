const dbConfig = require("../config/dbCalltech.config.js");
const Sequelize = require("sequelize");

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
    useUTC: false, // for reading from database
    timezone: "-03:00",
  },
  useUTC: false,
  timezone: "-03:00", // for writing to database
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.cloudInformacoesUsoTelas = require("./cloudInformacoesUsoTelas.model.js")(
  sequelize,
  Sequelize
);

db.pessoasFiliais = require("./pessoasFiliais.model.js")(sequelize, Sequelize);
db.pessoasContratosAtualizacoes =
  require("./pessoasContratosAtualizacoes.model.js")(sequelize, Sequelize);
db.cloudAlertaVersoes = require("./cloudAlertaVersoes.model.js")(
  sequelize,
  Sequelize
);

module.exports = db;
