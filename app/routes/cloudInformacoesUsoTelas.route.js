module.exports = (app) => {
  const cloudInformacoesUsoTelas = require("../controllers/cloudInformacoesUsoTelas.controller.js");
  const router = require("express").Router();

  router.post("/usosTelas/:id", cloudInformacoesUsoTelas.create);

  router.get("/usosTelas/:id", cloudInformacoesUsoTelas.findPesID);

  router.get("/ativaSmart/:id", cloudInformacoesUsoTelas.ativacao);

  router.post("/ativaSmart/:id", cloudInformacoesUsoTelas.ativacaoResult);
  router.post(
    "/ativaSmartVersoes/:id",
    cloudInformacoesUsoTelas.ativacaoVersao
  );

  app.use("/api", router);
};
