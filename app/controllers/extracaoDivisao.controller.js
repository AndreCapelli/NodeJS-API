const db = require("../models");
const ExtracoesDivisoes = db.extracoesDivisoes;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  ExtracoesDivisoes.findAll({
    where: {
      ExEstrelaExtracoesID: req.params.idEx,
      EsPessoasID: req.params.idPes,
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

exports.findAllUni = (req, res) => {
  ExtracoesDivisoes.findAll({
    where: {
      ExEstrelaExtracoesID: req.params.idEx,
      EsUnidadesID: req.params.idUni,
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

exports.createAll = (req, res) => {
  console.log(req.body);

  if (!req.body) {
    res.status(406).json({ message: "Body inválido" });
    return;
  }

  ExtracoesDivisoes.bulkCreate(req.body, { individualHooks: true })
    .then((data) => {
      res.status(201).json(data);
      return;
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: err.message + " - Erro ao adicionar ranges." });
    });
};
