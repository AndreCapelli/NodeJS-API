module.exports = (app) => {
  const router = require("express").Router();
  const db = require("../models/index");
  const sequelize = db.sequelize;
  const { QueryTypes } = require("sequelize");

  const robmarcontroller = require("../controllers/robmar.controller");

  //feito isso, todos os endpoints que eu fizer vai ser adicionado /api antes.
  app.use("/api", router);
  router.get("/robmar/campanhas", robmarcontroller.retcampanhas);
  router.post("/robmar/newPerson", robmarcontroller.newPerson);
  router.post("/robmar/GravaTxt", robmarcontroller.GravaTxt);
};
