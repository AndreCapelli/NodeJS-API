require("dotenv").config();

module.exports = {
  HOST: process.env.DB_SERVER,
  PORT: process.env.DB_PORT,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  driver: "msnodesqlv8",
  dialect: "mssql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// const sql = require("mssql/msnodesqlv8");

// const sqlConfig = {
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   server: process.env.DB_SERVER,
//   port: process.env.DB_PORT,
//   driver: "msnodesqlv8",
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000,
//   },
//   connectionTimeout: 150000,
//   options: {
//     enableArithAbort: true,
//   },
// };

// const pool = sql.connect(sqlConfig);

// module.exports = pool;
