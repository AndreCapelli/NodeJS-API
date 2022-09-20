module.exports = (app) => {
  const cloudInformacoesUsoTelas = require("../controllers/cloudInformacoesUsoTelas.controller.js");
  const router = require("express").Router();

  router.post("/", cloudInformacoesUsoTelas.create);

  app.use("/api/usosTelas/:ID", router);
};
