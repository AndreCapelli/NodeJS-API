module.exports = (app) => {
  const pessoa = require("../controllers/pessoas.controller.js");
  const router = require("express").Router();

  router.get("/buscaCredor/:Documento", pessoa.findOne);
  router.get("/AtualizaDocs/:Documentos", pessoa.johnTeste);
  router.post("/atualizaEmail/", pessoa.atualizaEmail);
  router.get("/combo/:DocInad&:DocCli", pessoa.buscaCombo);
  router.post("/RealizaAcordo/", pessoa.RealizaAcordo);
  router.post("/omie_Pedido/", pessoa.OmiePedido);

  app.use("/portal", router);
};
