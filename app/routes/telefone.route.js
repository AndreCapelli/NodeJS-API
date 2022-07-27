module.exports = (app) => {
  const telefone = require("../controllers/telefone.controller.js");
  const router = require("express").Router();

  router.post("/:id", telefone.create);

  router.get("/:id", telefone.findOne);

  router.put("/:id", telefone.update);

  //   router.delete("/:id", telefone.delete);
  app.use("/api/telefones", router);
};
