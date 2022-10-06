const sequelize = require("sequelize");
const db = require("../models");
const Pessoa = db.pessoas;
const Telefone = db.telefones;
const UnidadeEstrela = db.unidadesEstrela;
const SubUnidadesEstrela = db.subUnidadesEstrela;
const RotaEstrela = db.rotaEstrela;
const Op = db.Sequelize.Op;

/**
 * Exports. para sempre "exportar" o resultado do que acontecer
 * A próxima palavra é sempre o que foi declarado nas routas, ou seja, é sua função que é chamada
 * (req, res) respectivamente é o requerimento e a response da API
 *
 * Os métodos chamados após a const Pessoa são nativos do Sequelize, na documentação terá a explicação de todos
 * o resto é apenas JS
 */
exports.create = (req, res) => {
  if (!req.body.PesTipoPessoa) {
    res.status(406).json({ message: "Tipo de Pessoa não pode ser vazio" });
    return;
  }

  console.log(req.body);

  let pessoa;

  if (req.body.PesTipoPessoa == "F") {
    pessoa = {
      FPesNome: req.body.PesNome,
      FPesApelido: req.body.PesApelido,
      FPesCPF: req.body.PesDocumento,
      PesTipoPessoa: req.body.PesTipoPessoa,
      PesEndereco: req.body.PesEndereco,
      PesComplementoEndereco: req.body.PesComplementoEndereco,
      PesEnderecoNumero: req.body.PesEnderecoNumero,
      PesBairro: req.body.PesBairro,
      PesCidade: req.body.PesCidade,
      PesEstado: req.body.PesEstado,
      PesUF: req.body.PesUF,
      PesCEP: req.body.PesCEP,
      PesPDV: 1,
      PesOrigemCadastro: req.body.PesOrigemCadastro,
      PesUsuarioCadastrouID: req.body.PesUsuarioCadastrouID,
      PesEstrelaQuantidadeCartelas: req.body.PesEstrelaQuantidadeCartelas,
      PesIntegracoesEstrelaUnidadesID: req.body.PesIntegracoesEstrelaUnidadesID,
      PesIntegracoesEstrelaSUBUnidadesID:
        req.body.PesIntegracoesEstrelaSUBUnidadesID,
      PesEstrelaRotasID: req.body.PesEstrelaRotasID,
      PesIDImgApp: req.body.PesIDImgApp,
    };
  } else if (req.body.PesTipoPessoa == "J") {
    pessoa = {
      JPesRazaoSocial: req.body.PesNome,
      JPesNomeFantasia: req.body.PesApelido,
      JPesCNPJ: req.body.PesDocumento,
      PesTipoPessoa: req.body.PesTipoPessoa,
      PesEndereco: req.body.PesEndereco,
      PesComplementoEndereco: req.body.PesComplementoEndereco,
      PesEnderecoNumero: req.body.PesEnderecoNumero,
      PesBairro: req.body.PesBairro,
      PesCidade: req.body.PesCidade,
      PesEstado: req.body.PesEstado,
      PesUF: req.body.PesUF,
      PesCEP: req.body.PesCEP,
      PesPDV: 1,
      PesOrigemCadastro: req.body.PesOrigemCadastro,
      PesUsuarioCadastrouID: req.body.PesUsuarioCadastrouID,
      PesEstrelaQuantidadeCartelas: req.body.PesEstrelaQuantidadeCartelas,
      PesIntegracoesEstrelaUnidadesID: req.body.PesIntegracoesEstrelaUnidadesID,
      PesIntegracoesEstrelaSUBUnidadesID:
        req.body.PesIntegracoesEstrelaSUBUnidadesID,
      PesEstrelaRotasID: req.body.PesEstrelaRotasID,
      PesIDImgApp: req.body.PesIDImgApp,
    };
  } else {
    res.status(406).json({
      message:
        "Tipo de Pessoa inválido. Por favor verifique e tente novamente!",
    });
    return;
  }

  Pessoa.findOrCreate({
    where: {
      [Op.or]: [
        { JPesCNPJ: req.body.PesDocumento },
        { FPesCPF: req.body.PesDocumento },
      ],
    },
    defaults: pessoa,
  })
    .then(([data, created]) => {
      if (!created) {
        res
          .status(208)
          .json({ message: "Pessoa com esse documento já existe!" });
        return;
      }

      const PessoasID = data.Pessoas_ID;

      let contatos = req.body.contatosCadastro.map(function (ct) {
        var ddd = ct.PesTelefone.replace(/\s+/g, "").substring(0, 2);
        var telefone = ct.PesTelefone.replace(/\s+/g, "").substring(2);

        return {
          PesPessoasID: PessoasID,
          PesContato: ct.PesContato,
          PesDDD: ddd,
          PesTelefone: telefone,
          PesEmail: ct.PesEmail,
        };
      });

      Telefone.bulkCreate(contatos, { individualHooks: true })
        .then((dataContatos) => {
          if (!dataContatos) {
            res.status(406).send({
              message:
                "Problema ao fazer o cadastro de Telefone, tente mais tarde!",
            });
            return;
          } else {
            var jsonData = data.dataValues;
            jsonData["contatosCadastro"] = dataContatos;

            res.status(201).json(jsonData);
          }
        })
        .catch((err) => {
          res.status(500).send({ message: err.message || "Algo errado" });
        });
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message +
          " Algum erro aconteceu na criação da Pessoa. Tente mais tarde!",
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

exports.findDoc = (req, res) => {
  const id = req.params.doc;

  Pessoa.findOne({
    where: {
      [Op.or]: [{ JPesCNPJ: id }, { FPesCPF: id }],
    },
  })
    .then((data) => {
      if (!data) {
        res.status(204).json({ message: "Nenhum conteudo" });
        return;
      } else {
        Telefone.findAll({
          where: { PesPessoasID: data.Pessoas_ID },
          attributes: [
            "PessoasContatos_ID",
            "PesContato",
            "PesDDD",
            "PesTelefone",
            "PesContato",
            "PesEmail",
          ],
        })
          .then(async (dataContatos) => {
            if (data.length === 0) {
              res.status(204);
              return;
            } else {
              const buscaUnidade = await UnidadeEstrela.findByPk(
                data.PesIntegracoesEstrelaUnidadesID
              )
                .then((dataUni) => {
                  return dataUni;
                })
                .catch((err) => {
                  return {
                    InNome: "Vazio",
                  };
                });

              const buscaSubUnidade = await SubUnidadesEstrela.findByPk(
                data.PesIntegracoesEstrelaSUBUnidadesID
              )
                .then((dataSubUni) => {
                  return dataSubUni;
                })
                .catch((err) => {
                  return { InNomeSub: "Vazio" };
                });

              const buscaRota = await RotaEstrela.findByPk(
                data.PesEstrelaRotasID
              )
                .then((dataRota) => {
                  return dataRota;
                })
                .catch((err) => {
                  return { EsNome: "Vazio" };
                });

              let resPessoa;
              if (data.PesTipoPessoa == "F") {
                resPessoa = {
                  Pessoas_ID: data.Pessoas_ID,
                  PesNome: data.FPesNome,
                  PesApelido: data.FPesApelido,
                  PesDocumento: data.FPesCPF,
                  PesTipoPessoa: data.PesTipoPessoa,
                  PesEndereco: data.PesEndereco,
                  PesComplementoEndereco: data.PesComplementoEndereco,
                  PesEnderecoNumero: data.PesEnderecoNumero,
                  PesBairro: data.PesBairro,
                  PesCidade: data.PesCidade,
                  PesEstado: data.PesEstado,
                  PesUF: data.PesUF,
                  PesCEP: data.PesCEP,
                  PesEstrelaQuantidadeCartelas:
                    data.PesEstrelaQuantidadeCartelas,
                  PesIntegracoesEstrelaUnidadesNome: buscaUnidade.InNome,
                  PesIntegracoesEstrelaSUBUnidadesNome:
                    buscaSubUnidade.InNomeSub,
                  PesEstrelaRotasNome: buscaRota.EsNome,
                  PesIDImgApp: data.PesIDImgApp,
                };
              } else {
                resPessoa = {
                  Pessoas_ID: data.Pessoas_ID,
                  PesNome: data.JPesRazaoSocial,
                  PesApelido: data.JPesNomeFantasia,
                  PesDocumento: data.JPesCNPJ,
                  PesTipoPessoa: data.PesTipoPessoa,
                  PesEndereco: data.PesEndereco,
                  PesComplementoEndereco: data.PesComplementoEndereco,
                  PesEnderecoNumero: data.PesEnderecoNumero,
                  PesBairro: data.PesBairro,
                  PesCidade: data.PesCidade,
                  PesEstado: data.PesEstado,
                  PesUF: data.PesUF,
                  PesCEP: data.PesCEP,
                  PesEstrelaQuantidadeCartelas:
                    data.PesEstrelaQuantidadeCartelas,
                  PesIntegracoesEstrelaUnidadesNome: buscaUnidade.InNome,
                  PesIntegracoesEstrelaSUBUnidadesNome:
                    buscaSubUnidade.InNomeSub,
                  PesEstrelaRotasNome: buscaRota.EsNome,
                  PesIDImgApp: data.PesIDImgApp,
                };
              }

              const arrContatos = dataContatos.map((dt) => {
                return {
                  PessoasContatos_ID: dt.PessoasContatos_ID,
                  PesContato: dt.PesContato,
                  PesTelefone: dt.PesDDD + dt.PesTelefone,
                  PesEmail: dt.PesEmail,
                };
              });

              var jsonData = JSON.parse(JSON.stringify(resPessoa));
              // var jsonData = JSON.parse(resPessoa).dataValues;
              jsonData["contatosCadastro"] = arrContatos;
              res.status(200).json(jsonData);
            }
          })
          .catch((err) => {
            return res.status(500).json(err);
          });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Erro ao encontrar a Pessoa id=" + id,
      });
    });
};

exports.update = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(406).json({
      message: "ID necessário para concluir operação",
    });
    return;
  }

  if (!req.body.PesTipoPessoa) {
    res.status(406).json({ message: "Tipo de Pessoa não pode ser vazio" });
    return;
  }

  console.log(req.body);

  let pessoa;

  if (req.body.PesTipoPessoa == "F") {
    pessoa = {
      FPesNome: req.body.PesNome,
      FPesApelido: req.body.PesApelido,
      FPesCPF: req.body.PesDocumento,
      PesTipoPessoa: req.body.PesTipoPessoa,
      PesEndereco: req.body.PesEndereco,
      PesComplementoEndereco: req.body.PesComplementoEndereco,
      PesEnderecoNumero: req.body.PesEnderecoNumero,
      PesBairro: req.body.PesBairro,
      PesCidade: req.body.PesCidade,
      PesEstado: req.body.PesEstado,
      PesUF: req.body.PesUF,
      PesCEP: req.body.PesCEP,
      PesPDV: 1,
      PesOrigemCadastro: req.body.PesOrigemCadastro,
      PesUsuarioCadastrouID: req.body.PesUsuarioCadastrouID,
      PesEstrelaQuantidadeCartelas: req.body.PesEstrelaQuantidadeCartelas,
      PesIntegracoesEstrelaUnidadesID: req.body.PesIntegracoesEstrelaUnidadesID,
      PesIntegracoesEstrelaSUBUnidadesID:
        req.body.PesIntegracoesEstrelaSUBUnidadesID,
      PesEstrelaRotasID: req.body.PesEstrelaRotasID,
      PesIDImgApp: req.body.PesIDImgApp,
    };
  } else if (req.body.PesTipoPessoa == "J") {
    pessoa = {
      JPesRazaoSocial: req.body.PesNome,
      JPesNomeFantasia: req.body.PesApelido,
      JPesCNPJ: req.body.PesDocumento,
      PesTipoPessoa: req.body.PesTipoPessoa,
      PesEndereco: req.body.PesEndereco,
      PesComplementoEndereco: req.body.PesComplementoEndereco,
      PesEnderecoNumero: req.body.PesEnderecoNumero,
      PesBairro: req.body.PesBairro,
      PesCidade: req.body.PesCidade,
      PesEstado: req.body.PesEstado,
      PesUF: req.body.PesUF,
      PesCEP: req.body.PesCEP,
      PesPDV: 1,
      PesOrigemCadastro: req.body.PesOrigemCadastro,
      PesUsuarioCadastrouID: req.body.PesUsuarioCadastrouID,
      PesEstrelaQuantidadeCartelas: req.body.PesEstrelaQuantidadeCartelas,
      PesIntegracoesEstrelaUnidadesID: req.body.PesIntegracoesEstrelaUnidadesID,
      PesIntegracoesEstrelaSUBUnidadesID:
        req.body.PesIntegracoesEstrelaSUBUnidadesID,
      PesEstrelaRotasID: req.body.PesEstrelaRotasID,
      PesIDImgApp: req.body.PesIDImgApp,
    };
  } else {
    res.status(406).json({
      message:
        "Tipo de Pessoa inválido. Por favor verifique e tente novamente!",
    });
    return;
  }

  Pessoa.update(pessoa, {
    where: { Pessoas_ID: id },
  })
    .then(async (num) => {
      if (num == 1) {
        const contatos = req.body.contatosCadastro.map(function (ct) {
          var ddd = ct.PesTelefone.replace(/\s+/g, "").substring(0, 2);
          var telefone = ct.PesTelefone.replace(/\s+/g, "").substring(2);

          return {
            PesPessoasID: id,
            PesContato: ct.PesContato,
            PesDDD: ddd,
            PesTelefone: telefone,
            PesEmail: ct.PesEmail,
          };
        });

        await Telefone.destroy({ where: { PesPessoasID: id } });

        Telefone.bulkCreate(contatos, { individualHooks: true })
          .then((dataContatos) => {
            !dataContatos
              ? res.status(200).send({ message: "Atualização Concluída" })
              : res
                  .status(209)
                  .send({ message: "Pessoa e alguns telefones atualizados" });
          })
          .catch((err) => {
            res.status(500).send({ message: err.message || "Algo errado" });
          });
      } else {
        res
          .status(406)
          .json({ message: "Não foi possível atualizar a Pessoa " + id + "." });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Xuparacada",
      });
    });
};
