const db = require("../models");
const ExtracoesDivisoes = db.extracoesDivisoes;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  ExtracoesDivisoes.findAll({
    where: {
      ExtracoesDivisoes_ID: req.params.id,
    },
  })
    .then((data) => {
      if (!data) {
        res.send(204);
        return;
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
