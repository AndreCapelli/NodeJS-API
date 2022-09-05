module.exports = (app) => {
  const extracoesDivisoes = require("../controllers/extracaoDivisao.controller.js");
  const router = require("express").Router();

  router.get("/:id", extracoesDivisoes.findAll);

  app.use("/api/extracoesDivisoes", router);
};
