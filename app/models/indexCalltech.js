const Sequelize = require("sequelize");

const sequelize = new Sequelize("Calltech_Oficial", "sa", "NAQfed24086", {
  host: "200.150.198.251",
  port: "1433",
  dialect: "mssql",
  pool: {
    max: 15,
    min: 0,
    acquire: 30000,
    idle: 10000,
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

module.exports = db;
