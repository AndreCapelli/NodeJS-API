const db = require("../models");
const Pessoa = db.pessoas;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  if (!req.body.PesTipoPessoa) {
    res.status(406).json({ message: "Tipo de Pessoa não pode ser vazio" });
    return;
  }

  let pessoa;

  if (req.body.PesTipoPessoa == "F") {
    pessoa = {
      FPesNome: req.body.FPesNome,
      FPesApelido: req.body.FPesApelido,
      FPesCPF: req.body.FPesCPF,
      PesTipoPessoa: req.body.PesTipoPessoa,
      PesEndereco: req.body.PesEndereco,
      PesComplementoEndereco: req.body.PesComplementoEndereco,
      PesEnderecoNumero: req.body.PesEnderecoNumero,
      PesBairro: req.body.PesBairro,
      PesCidade: req.body.PesCidade,
      PesEstado: req.body.PesEstado,
      PesUF: req.body.PesUF,
      PesCEP: req.body.PesCEP,
    };
  } else if (req.body.PesTipoPessoa == "J") {
    pessoa = {
      JPesRazaoSocial: req.body.JPesRazaoSocial,
      JPesNomeFantasia: req.body.JPesNomeFantasia,
      JPesCNPJ: req.body.JPesCNPJ,
      PesTipoPessoa: req.body.PesTipoPessoa,
      PesEndereco: req.body.PesEndereco,
      PesComplementoEndereco: req.body.PesComplementoEndereco,
      PesEnderecoNumero: req.body.PesEnderecoNumero,
      PesBairro: req.body.PesBairro,
      PesCidade: req.body.PesCidade,
      PesEstado: req.body.PesEstado,
      PesUF: req.body.PesUF,
      PesCEP: req.body.PesCEP,
    };
  } else {
    res.status(406).json({
      message:
        "Tipo de Pessoa inválido. Por favor verifique e tente novamente!",
    });
    return;
  }

  Pessoa.create(pessoa)
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message ||
          "Algum erro aconteceu na criação da Pessoa. Tente mais tarde!",
      });
    });
};

exports.findAll = (req, res) => {
  //const pesDocumento = req.query.PesDocumento;

  Pessoa.findAll({
    //where: { FPesCPF: pesDocumento },
    attributes: ["Pessoas_ID", "FPesNome", "FPesCPF"],
  })
    .then((data) => {
      if (!data) {
        res.status(204).json({ message: "Nenhuma Pessoa encontrada" });
        return;
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Erro inesperado. Tente novamente mais tarde",
      });
    });
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  Pessoa.findByPk(id, {
    attributes: [
      "Pessoas_ID",
      "FPesNome",
      "FPesCPF",
      "PesEndereco",
      "PesComplementoEndereco",
      "PesEnderecoNumero",
      "PesBairro",
      "PesCidade",
      "PesEstado",
      "PesUF",
      "PesCEP",
    ],
  })
    .then((data) => {
      if (!data) {
        res.status(204).json({ message: "Nenhum conteudo" });
        return;
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Erro ao encontrar a Pessoa id=" + id,
      });
    });
};

exports.update = (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(406).json({
      message: "ID necessário para concluir operação",
    });
    return;
  }

  Pessoa.update(req.body, {
    where: { Pessoas_ID: id },
  })
    .then((num) => {
      if (num == 1) {
        res
          .status(200)
          .json({ message: "Pessoa :" + id + " atualizada com Sucesso!" });
      } else {
        res
          .status(406)
          .json({ message: "Não foi possível atualizar a Pessoa " + id + "." });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Erro ao atualizar. Tente mais tarde!",
      });
    });
};
