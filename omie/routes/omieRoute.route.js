module.exports = (app) => {
  const omie = require("../controllers/omie.controllers.js");
  const router = require("express").Router();
  router.post("/omie_Pedido/", omie.OmiePedido);
  router.post("/omie_Produto/", omie.OmieProduto);
  router.post("/omie_Cliente/", omie.OmieCliente);

  app.use("/omie", router);
};
