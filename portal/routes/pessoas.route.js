module.exports = (app) => {
  const pessoa = require("../controllers/pessoas.controller.js");
  const router = require("express").Router();

  router.get("/buscaCredor/:Documento", pessoa.findOne);

  app.use("/portal", router);
};
