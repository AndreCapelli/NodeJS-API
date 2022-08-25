const dbConfig = require("../config/db.config.js");
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
});

// try {
//   sequelize.authenticate();
//   console.log("Connection has been established successfully.");
// } catch (error) {
//   console.error("Unable to connect to the database:", error);
// }

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
/**
 * Sequelize sendo chamado para cada model, afim de reconhecer as tabelas que ele lê direto da base
 * Sempre que declarar um novo model necessário declarar aqui, caso contrário não terá a chamada
 */
db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
db.usuarios = require("./usuario.model.js")(sequelize, Sequelize);
db.pessoas = require("./pessoa.model.js")(sequelize, Sequelize);
db.telefones = require("./telefone.model.js")(sequelize, Sequelize);
db.unidadesEstrela = require("./unidadeEstrela.model.js")(sequelize, Sequelize);
db.subUnidadesEstrela = require("./subUnidadeEstrela.model.js")(
  sequelize,
  Sequelize
);
db.rotaEstrela = require("./rotaEstrela.model.js")(sequelize, Sequelize);
db.estrelaExtracoes = require("./estrelaExtracoes.model.js")(
  sequelize,
  Sequelize
);

module.exports = db;
