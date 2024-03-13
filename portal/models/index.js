const dbConfig = require("../../portal/config/db.config");
const Sequelize = require("sequelize");

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

// try {
//   sequelize.authenticate();
//   console.log("Connection Candiotto feita.");
// } catch (error) {
//   console.error("Erro candiotto:", error);
// }

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.pessoas = require("./pessoas.model.js")(sequelize, Sequelize);
db.pessoasContatos = require("./pessoasContatos.model.js")(sequelize, Sequelize);
db.movimentacoes = require("./movimentacoes.model.js")(sequelize, Sequelize);
db.campanhasPessoas = require("./campanhaspessoas.model.js")(sequelize, Sequelize);
db.politicas = require("./politicas.model.js")(sequelize, Sequelize);

module.exports = db;
