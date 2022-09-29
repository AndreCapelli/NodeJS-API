require("dotenv").config();

module.exports = {
  HOST: process.env.DB_SERVER_ROB,
  PORT: process.env.DB_PORT_ROB,
  USER: process.env.DB_USER_ROB,
  PASSWORD: process.env.DB_PASSWORD_ROB,
  DB: process.env.DB_NAME_ROB,
  driver: "msnodesqlv8",
  dialect: "mssql",
  pool: {
    max: 15,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

/*Config padrão da conexão com o SQL Server
Se não encontrar as variáveis, criar arquivo .env
com os mesmos nomes e suas respectivas configurações 


"mssql": "^8.1.2",
"tedious": "^14.6.0",

*/
