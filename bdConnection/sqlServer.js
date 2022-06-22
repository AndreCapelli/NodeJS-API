require("dotenv").config();
const sql = require("mssql");

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  port: 1433,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: false, // change to true for local dev / self-signed certs
  },
};

sql.on("error", (err) => {
  console.log(err);
});

async function getDBUserAsyncFunction() {
  try {
    let pool = await sql.connect(sqlConfig);
    let result = await pool.request().query("SELECT * FROM Usuarios");

    console.log(result);

    sql.close();
  } catch (error) {
    console.log(error.message);
    sql.close();
  }
}

getDBUserAsyncFunction();
