module.exports = (app) => {
  const omie = require("../controllers/omie.controllers.js");
  const router = require("express").Router();
  router.post("/omie_Pedido/", omie.OmiePedido);

  app.use("/omie", router);
};
