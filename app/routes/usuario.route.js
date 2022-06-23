module.exports = (app) => {
  const usuario = require("../controllers/usuario.controller.js");
  const router = require("express").Router();
  // Create a new Usuario
  router.post("/", usuario.create);
  // Retrieve all usuario
  router.get("/", usuario.findAll);
  // Retrieve a single Usuario with id
  router.get("/:id", usuario.findOne);
  // Update a Usuario with id
  router.put("/:id", usuario.update);
  // Delete a Usuario with id
  router.delete("/:id", usuario.delete);
  app.use("/api/usuarios", router);
};
