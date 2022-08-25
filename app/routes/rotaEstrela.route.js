module.exports = (app) => {
  const rotaEstrela = require("../controllers/rotaEstrela.controller.js");
  const router = require("express").Router();

  router.get("/:id", rotaEstrela.findAll);

  app.use("/api/rotasEstrela", router);
};
