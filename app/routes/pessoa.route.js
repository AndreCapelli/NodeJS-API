module.exports = (app) => {
  const pessoa = require("../controllers/pessoa.controller.js");
  const router = require("express").Router();
  // Criar uma nova pessoa
  router.post("/", pessoa.create);
  // Get em todas as pessoas
  router.get("/", pessoa.findAll);
  // Get em uma única pessoa por algum parametro :id (id no caso é apenas nomenclatura na hora de pegar esse valor)
  router.get("/id/:id", pessoa.findOne);
  // Get em uma única pessoa por algum parametro :id (id no caso é apenas nomenclatura na hora de pegar esse valor)
  router.get("/:doc", pessoa.findDoc);
  // Update uma pessoa por algum parametro :id (id no caso é apenas nomenclatura na hora de pegar esse valor)
  router.put("/:id", pessoa.update);
  //   // Delete uma pessoa por algum parametro :id (id no caso é apenas nomenclatura na hora de pegar esse valor)
  //   router.delete("/:id", pessoa.delete);

  router.post("/ml/:filialID", pessoa.pessoaML);
  router.get("/ml/origens/:filialID", pessoa.origens);
  router.get("/ml/consultores/:filialID", pessoa.consultores);
  /**
   * Declarar o use para identificar qual o endpoint completo dessa URL, no caso de Pessoas é
   * {URL_servidor}:{Porta}/api/pessoas e o resto é complementar ao que está feito acima ^^
   */
  app.use("/api/pessoas", router);
};

/**
 * Rotas da Pessoa, sempre que necessário uma nova rota na criação da api, referente a estrutura que está criada é necessário declarar em suas route.js
 */
