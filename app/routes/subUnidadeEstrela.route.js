module.exports = (app) => {
  const subUnidadeEstrela = require("../controllers/subUnidadeEstrela.controller.js");
  const router = require("express").Router();
  router.get("/:id", subUnidadeEstrela.findAll);

  app.use("/api/subUnidadesEstrela", router);
};
