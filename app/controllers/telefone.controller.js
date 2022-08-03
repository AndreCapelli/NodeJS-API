const db = require("../models");
const Telefone = db.telefones;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  const usuarioLogado = req.params.id;

  if (!usuarioLogado) {
    res.status(406).send({ message: "Informar Usuário!" });
    return;
  }

  const arrayContatos = req.body.length;

  if (arrayContatos > 1) {
    Telefone.bulkCreate(req.body, { individualHooks: true })
      .then((data) => {
        if (!data) {
          res.status(406).send({
            message:
              "Problema ao fazer o cadastro de Telefone, tente mais tarde!",
          });
          return;
        } else {
          res.status(201).json(data);
        }
      })
      .catch((err) => {
        res.status(500).send({ message: err.message || "Algo errado" });
      });
  } else {
    const contato = {
      PesPessoasID: req.body.PesPessoasID,
      PesContato: req.body.PesContato,
      PesDDD: req.body.PesDDD,
      PesTelefone: req.body.PesTelefone,
      PesEmail: req.body.PesEmail,
    };

    Telefone.create(contato)
      .then((data) => {
        if (!data) {
          res.status(406).send({
            message:
              "Problema ao fazer o cadastro de Telefone, tente mais tarde!",
          });
          return;
        } else {
          res.status(201).json(data);
        }
      })
      .catch((err) => {
        res.status(500).send({ message: err.message || "Algo errado" });
      });
  }
};

exports.findOne = (req, res) => {
  const PesPessoasID = req.params.id;

  if (!PesPessoasID) {
    res.status(406).send({ message: "Não foi possível concluir a busca" });
    return;
  }

  Telefone.findAll({
    where: { PesPessoasID: PesPessoasID },
    attributes: [
      "PessoasContatos_ID",
      "PesContato",
      "PesDDD",
      "PesTelefone",
      "PesEmail",
    ],
  })
    .then((data) => {
      if (data.length === 0) {
        res.status(204).send();
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Erro inesperado" });
    });
};

exports.update = (req, res) => {
  const PessoasContatos_ID = req.params.id;

  if (!PessoasContatos_ID) {
    res.status(406).send({
      message: "Não foi possível atualizar esse contato" + PessoasContatos_ID,
    });
    return;
  }

  Telefone.update(req.body, {
    where: { PessoasContatos_ID: PessoasContatos_ID },
  })
    .then((num) => {
      if (num == 0) {
        res.status(406).json({
          message:
            "Não foi possível atualizar esse contato " + PessoasContatos_ID,
        });
      } else {
        res
          .status(200)
          .json({ message: "Contato " + PessoasContatos_ID + " atualizado" });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Erro ao atualizar. Tente mais tarde!",
      });
    });
};
