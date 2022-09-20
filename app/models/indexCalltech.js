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
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.cloudInformacoesUsoTelas = require("./cloudInformacoesUsoTelas.model.js")(
  sequelize,
  Sequelize
);

module.exports = db;
