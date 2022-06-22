require("dotenv").config();
const sql = require("mssql/msnodesqlv8");
const express = require("express");
const app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  port: process.env.DB_PORT,
  driver: "msnodesqlv8",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 150000,
  options: {
    enableArithAbort: true,
  },
};

sql.on("error", (err) => {
  console.log(err);
});

async function getDBUserAsyncFunction(id) {
  if (!id) {
    try {
      const pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .query("SELECT Usuarios_ID, UsNome, UsLogin, UsSenha FROM Usuarios");

      console.log(result);

      sql.close();

      return result;
    } catch (error) {
      console.log(error.message);
      sql.close();
    }
  } else {
    try {
      const pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .input("Usuarios_ID", sql.Int, id)
        .query(
          "SELECT Usuarios_ID, UsNome, UsLogin, UsSenha FROM Usuarios WHERE Usuarios_ID = @Usuarios_ID"
        );

      console.log(result);

      sql.close();

      return result;
    } catch (error) {
      console.log(error.message);
      sql.close();
    }
  }
}

async function insertUser() {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("Usuarios_ID", sql.Int, parseInt(id))
      .query(
        "SELECT Usuarios_ID, UsNome, UsLogin, UsSenha FROM Usuarios WHERE Usuarios_ID = @Usuarios_ID"
      );

    console.log(result);
    sql.close();

    return result;
  } catch (error) {
    console.log(error.message);
    sql.close();
  }
}

app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  const result = await getDBUserAsyncFunction(id);

  res.status(200).json({ result: result.recordset[0] });
});

app.get("/users", async (req, res) => {
  try {
    const jsonResult = await getDBUserAsyncFunction();

    res.status(200).json({ result: jsonResult.recordset });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.post("/", async (req, res) => {
  const { name, cpf } = req.body;

  if (!name) {
    res.status(422).json({ error: "O nome é obrigatório" });
    return;
  }

  if (!cpf) {
    res.status(422).json({ error: "O CPF/CNPJ é obrigatório" });
    return;
  }
});

app.listen(3000);
