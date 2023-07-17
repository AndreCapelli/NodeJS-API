const express = require("express");
const https = require("https"); //j
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const apps = express(); //j
const db = require("./app/models");
const dbrob = require("./robmar/models");
const dbPortal = require("./portal/models");

const fs = require("fs");

const options = {
  key: fs.readFileSync("./SSL/code.key"),
  cert: fs.readFileSync("./SSL/code.crt"),
};

https.createServer(options, apps).listen(443, () => {
  console.log("Servidor HTTPS iniciado na porta 443");
});

apps.get("/", (req, res) => {
  res.json({ message: "Welcome - API MaxMobile https" });
});

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

const corsOptions = {
  origin: "*",
};

app.options(cors(corsOptions));

app.use(cors());

// parse requests of content-type - application/json
// app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));

// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(
//   bodyParser.urlencoded({
//     limit: "50mb",
//     extended: true,
//     parameterLimit: 50000,
//   })
// );

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome - API MaxMobile" });
});

const calc = require("./funcoes_utils/calculos/calculos");
app.get("/usaCalculo", async (req, res) => {
  const calculoJuros = await calc.CalculaPrice(1, 5, 1, 1, 1);
  console.log(calculoJuros);
  res.status(200).json(calculoJuros);
});

/* Após a criação de uma nova rota, declarar abaixo
para validar sua endpoint na estrutura */
require("./app/routes/tutorial.route")(app);
require("./app/routes/usuario.route")(app);
require("./app/routes/pessoa.route")(app);
require("./app/routes/telefone.route")(app);
require("./app/routes/unidadeEstrela.route")(app);
require("./app/routes/subUnidadeEstrela.route")(app);
require("./app/routes/rotaEstrela.route")(app);
require("./app/routes/estrelaExtracoes.route")(app);
require("./app/routes/extracaoDivisao.route")(app);
require("./app/routes/cloudInformacoesUsoTelas.route")(app);
require("./robmar/routes/robmar.route")(app);
require("./portal/routes/pessoas.route")(app);
require("./api_ligacao/routes/filial.route")(app);

// set port, listen for requests
const PORT = 21000;
//const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
