const db = require("../models");
const EstrelaExtracoes = db.estrelaExtracoes;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  EstrelaExtracoes.findAll({
    where: {
      EsStatus: 0,
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
