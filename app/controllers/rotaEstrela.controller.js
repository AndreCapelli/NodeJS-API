const db = require("../models");
const RotaEstrela = db.rotaEstrela;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  if (!req.params.id) {
    res.send(406).json({ message: "ID inválido" });
    return;
  }

  RotaEstrela.findAll({
    where: {
      EsIntegracoesEstrelaUnidadesID: req.params.id,
    },
  })
    .then((data) => {
      if (data.length == 0) {
        res.status(204).json({ message: "Nenhuma rota encontrada" });
        return;
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.send(500).json(err);
    });
};
