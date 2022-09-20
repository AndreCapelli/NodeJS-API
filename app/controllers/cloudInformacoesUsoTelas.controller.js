const db = require("../models/indexCalltech");
const CloudInformacoesUsoTelas = db.cloudInformacoesUsoTelas;
const Op = db.Sequelize.Op;
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
