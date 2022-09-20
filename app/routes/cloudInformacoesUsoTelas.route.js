module.exports = (app) => {
  const cloudInformacoesUsoTelas = require("../controllers/cloudInformacoesUsoTelas.controller.js");
  const router = require("express").Router();

  router.post("/:id", cloudInformacoesUsoTelas.create);

  router.get("/:id", cloudInformacoesUsoTelas.findPesID);

  app.use("/api/usosTelas", router);
};
