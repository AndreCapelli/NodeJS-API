module.exports = (app) => {
  const cloudInformacoesUsoTelas = require("../controllers/cloudInformacoesUsoTelas.controller.js");
  const router = require("express").Router();

  router.post("/usosTelas/:id", cloudInformacoesUsoTelas.create);

  router.get("/usosTelas/:id", cloudInformacoesUsoTelas.findPesID);

  router.get("/ativaSmart/:id", cloudInformacoesUsoTelas.ativacao);

  app.use("/api", router);
};
