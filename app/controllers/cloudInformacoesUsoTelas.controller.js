const db = require("../models/indexCalltech");
const CloudInformacoesUsoTelas = db.cloudInformacoesUsoTelas;
const { QueryTypes } = require("sequelize");
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;

exports.create = (req, res) => {
  if (req.params.id != `9.)O2D`) {
    res.status(406).json({ message: "Informação inválida" });
    return;
  }

  const ClPessoasFiliaisID = req.body.map((ct) => {
    return ct.ClPessoasFiliaisID;
  });

  async function DeletaPessoasFiliaisID() {
    const result = await sequelize.query(
      "DELETE FROM CloudInformacoesUsoTelas WHERE ClPessoasFiliaisID = " +
        ClPessoasFiliaisID[0],
      {
        type: QueryTypes.SELECT,
      }
    );

    return result;
  }

  DeletaPessoasFiliaisID();

  CloudInformacoesUsoTelas.bulkCreate(req.body, {
    individualHooks: true,
  })
    .then((data) => {
      if (!data) {
        res.status(406).send({ message: "Problema ao inserir" });
        return;
      } else {
        res.status(201).json(data);
        return;
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
          const jsonDT = data.map((ct) => {
            return {
              PePessoasID: ct.PePessoasID,
              Nome: ct.Nome,
            };
          });

          res.send(jsonDT[0]);
          return;
        }
      })
      .catch((err) => {
        res.send({ message: "Error " + err.message });
        return;
      });

    return result;
  }

  ProcuraPesID();
};

exports.ativacao = (req, res) => {
  if (req.params.id != `9.)O2D`) {
    res.status(406).json({ message: "Informação inválida" });
    return;
  }

  if (req.body.ClPessoasFiliaisID == "") {
    res.status(406).json({ message: "Sem Filial ID" });
    return;
  }

  const PesFilialID = req.body.ClPessoasFiliaisID;

  async function ProcuraAtivacao() {
    const result = await sequelize
      .query(
        "SELECT PessoasContratos_ID, PeStatusContrato, PeDataExpiracao,  " +
          " PeQtdOperadores, PeQtdSupervisores FROM PessoasContratos " +
          " Inner Join Solucoes ON Solucoes_ID = PeSolucoesID " +
          " Where PePessoasFiliaisID = " +
          PesFilialID +
          " And SoNome = ''MaxSmart'' order by PessoasContratos_ID desc",
        {
          type: QueryTypes.SELECT,
        }
      )
      .then((data) => {
        if (!data) {
          res.send({ message: "Nada encontrado" });
          return;
        } else {
          const jsonDT = data.map((ct) => {
            return {
              PessoasContratos_ID: ct.PessoasContratos_ID,
              PeStatusContrato: ct.PeStatusContrato,
              PeDataExpiracao: ct.PeDataExpiracao,
              PeQtdOperadores: ct.PeQtdOperadores,
              PeQtdSupervisores: ct.PeQtdSupervisores,
            };
          });

          res.send(jsonDT[0]);
          return;
        }
      })
      .catch((err) => {
        res.send({ message: "Error " + err.message });
        return;
      });

    return result;
  }

  ProcuraAtivacao();
};
