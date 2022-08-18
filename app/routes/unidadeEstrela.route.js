module.exports = (app) => {
  const unidadeEstrela = require("../controllers/unidadeEstrela.controller.js");
  const router = require("express").Router();
  router.get("/:id", unidadeEstrela.findAll);

  app.use("/api/unidadesEstrela", router);
};
