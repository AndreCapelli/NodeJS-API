const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./app/models");

/* Sequelize.SYNC com o force true para limpar as tabelas
declaradas nos models */

// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

//db.sequelize.sync();

// var corsOptions = {
//   origin: "http://localhost:3000",
// };

// app.use(cors(corsOptions));

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome - API MaxMobile" });
});

/* Após a criação de uma nova rota, declarar abaixo
para validar sua endpoint na estrutura */
require("./app/routes/tutorial.route")(app);
require("./app/routes/usuario.route")(app);
require("./app/routes/pessoa.route")(app);
require("./app/routes/telefone.route")(app);

// set port, listen for requests
const PORT = 21161;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
