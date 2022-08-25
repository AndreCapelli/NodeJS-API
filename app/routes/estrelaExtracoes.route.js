module.exports = (app) => {
  const estrelaExtracoes = require("../controllers/estrelaExtracoes.controller.js");
  const router = require("express").Router();

  router.get("/:id", estrelaExtracoes.findAll);

  app.use("/api/estrelaExtracoes", router);
};
