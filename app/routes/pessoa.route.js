module.exports = (app) => {
  const pessoa = require("../controllers/pessoa.controller.js");
  const router = require("express").Router();
  // Create a new pessoa
  router.post("/", pessoa.create);
  // Retrieve all pessoa
  router.get("/", pessoa.findAll);
  // Retrieve a single pessoa with id
  router.get("/:id", pessoa.findOne);
  // Update a pessoa with id
  router.put("/:id", pessoa.update);
  //   // Delete a pessoa with id
  //   router.delete("/:id", pessoa.delete);
  app.use("/api/pessoas", router);
};
