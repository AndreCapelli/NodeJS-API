module.exports = (app) => {
  const router = require("express").Router();
  const db = require("../models/index");
  const sequelize = db.sequelize;
  const { QueryTypes } = require("sequelize");

  const filialController = require("../controllers/filial.controller");

  //feito isso, todos os endpoints que eu fizer vai ser adicionado /api antes.
  app.use("/api", router);
  router.get("/api_ligacao/apiLife", filialController.apiLife);
  router.post("/api_ligacao/novoContatoSite", filialController.novoContatoSite);
  router.post("/api_ligacao/retornaUsuario", filialController.retornaUsuario);
  router.post(
    "/api_ligacao/retornaCredenciais",
    filialController.retornaCredenciais
  );
};
