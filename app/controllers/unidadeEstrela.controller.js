const db = require("../models");
const UnidadeEstrela = db.unidadesEstrela;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  if (!req.params.id) {
    res.status(406).send({ message: "Usuário não é válido! Tente novamente" });
    return;
  }

  UnidadeEstrela.findAll({
    where: {
      InAtivo: true,
    },
    attributes: [
      "IntegracoesEstrelaUnidades_ID",
      "InNome",
      "InObrigaSubUnidades",
    ],
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
        message: err.message || "Erro ao buscar Unidades. Tente novamente!",
      });
    });
};
