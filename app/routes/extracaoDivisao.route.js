module.exports = (app) => {
  const extracoesDivisoes = require("../controllers/extracaoDivisao.controller.js");
  const router = require("express").Router();

  router.get("/U/:idEx&:idUni", extracoesDivisoes.findAllUni);
  router.get("/:idEx&:idPes", extracoesDivisoes.findAll);
  router.post("/", extracoesDivisoes.createAll);

  app.use("/api/extracoesDivisoes", router);
};
