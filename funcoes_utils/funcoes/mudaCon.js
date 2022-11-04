const Sequelize = require("sequelize");

exports.Conn = (db, user, pw, host, port) => {
  const sequelize = new Sequelize(db, user, pw, {
    host: host,
    port: port,
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

  const data = {};
  data.Sequelize = Sequelize;
  data.sequelize = sequelize;

  return data;
};
