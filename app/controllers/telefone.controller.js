const db = require("../models");
const Telefone = db.telefones;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  const usuarioLogado = req.params.id;

  console.log(req.body);

  if (!usuarioLogado) {
    res.status(406).send({ message: "Informar Usuário!" });
    return;
  }

  const arrayContatos = req.body.length;

  if (arrayContatos > 1) {
    let contatos = req.body.map(function (ct) {
      var ddd = ct.PesTelefone.substring(0, 2);
      var telefone = ct.PesTelefone.substring(2);

      return {
        PesPessoasID: ct.PesPessoasID,
        PesContato: ct.PesContato,
        PesDDD: ddd,
        PesTelefone: telefone,
        PesEmail: ct.PesEmail,
      };
    });

    Telefone.bulkCreate(contatos, { individualHooks: true })
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
    var ddd = req.body.PesTelefone.substring(0, 2);
    var telefone = req.body.PesTelefone.substring(2);

    const contato = {
      PesPessoasID: req.body.PesPessoasID,
      PesContato: req.body.PesContato,
      PesDDD: ddd,
      PesTelefone: telefone,
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
