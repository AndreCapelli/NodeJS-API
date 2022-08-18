const db = require("../models");
const SubUnidadeEstrela = db.subUnidadesEstrela;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  if (!req.params.id) {
    res
      .status(406)
      .send({ message: "Unidade não é permitida vazia! Tente novamente" });
    return;
  }

  SubUnidadeEstrela.findAll({
    where: {
      InIntegracoesEstrelaUnidadesID: req.params.id,
    },
    attributes: ["IntegracoesEstrelaSUBUnidades_ID", "InNomeSub"],
  })
    .then((data) => {
      if (!data) {
        res.status(204);
        return;
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Erro ao buscar SubUnidades. Tente novamente!",
      });
    });
};
