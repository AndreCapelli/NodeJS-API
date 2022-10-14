module.exports = (app) => {
  const pessoa = require("../controllers/pessoas.controller.js");
  const router = require("express").Router();

  router.get("/buscaCredor", pessoa.findOne);

  app.use("/portal", router);
};
