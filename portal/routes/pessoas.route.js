module.exports = (app) => {
  const pessoa = require("../controllers/pessoas.controller.js");
  const router = require("express").Router();

  router.get("/buscaCredor/:Documento", pessoa.findOne);
  router.post("/atualizaEmail/", pessoa.atualizaEmail);
  router.get("/combo/:DocInad&:DocCli", pessoa.buscaCombo);

  app.use("/portal", router);
};
