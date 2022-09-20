const db = require("../models/indexCalltech");
const CloudInformacoesUsoTelas = db.cloudInformacoesUsoTelas;
const PessoasFiliais = db.pessoasFiliais;
const { QueryTypes } = require("sequelize");
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
// Create and Save a new Usuario
exports.create = (req, res) => {
  if (req.params.id != `9.)O2D`) {
    res.status(406).json({ message: "Informação inválida" });
    return;
  }

  const ClPessoasFiliaisID = req.body.map((ct) => {
    return ct.ClPessoasFiliaisID;
  });

  CloudInformacoesUsoTelas.destroy({
    where: { ClPessoasFiliaisID },
  })
    .then((data) => {
      if (data >= 1) {
        res.status(200).json({ message: "Deletado" });
      } else {
        res
          .status(406)
          .json({ message: "Erro ao deletar" + ClPessoasFiliaisID });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Erro inesperado " + err.message });
    });

  CloudInformacoesUsoTelas.bulkCreate(req.body, { individualHooks: true })
    .then((data) => {
      if (!data) {
        res.status(406).send({ message: "Problema ao inserir" });
        return;
      } else {
        res.status(201).json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while creating the New User.",
      });
    });
};

exports.findPesID = (req, res) => {
  if (req.params.id != `9.)O2D`) {
    res.status(406).json({ message: "Informação inválida" });
    return;
  }

  if (req.body.ClPessoasFiliaisID == "") {
    res.status(406).json({ message: "Sem Filial ID" });
    return;
  }

  const PesFilialID = req.body.ClPessoasFiliaisID;

  async function ProcuraPesID() {
    const result = await sequelize
      .query(
        "SELECT PePessoasID, dbo.retornaNomeRazaoSocial(PePessoasID) Nome  " +
          " FROM PessoasFiliais WHERE PessoasFiliais_ID = " +
          PesFilialID,
        {
          type: QueryTypes.SELECT,
        }
      )
      .then((data) => {
        if (!data) {
          res.send({ message: "Nada encontrado" });
          return;
        } else {
          res.send(data);
          return;
        }
      })
      .catch((err) => {
        res.send({ message: "Bla " + err.message });
        return;
      });

    return result;
  }

  ProcuraPesID();
};
