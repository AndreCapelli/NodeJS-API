module.exports = (apps) => {
  const omie = require("../controllers/omie.controllers.js");
  const router = require("express").Router();
  router.post("/omie_Pedido/", omie.OmiePedido);
  apps.use("/omie", router);
};
