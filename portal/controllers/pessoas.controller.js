const sequelize = require("sequelize");
const db = require("../models");
const Pessoas = db.pessoas;
const Movimentacoes = db.movimentacoes;
const Politicas = db.politicas;
const Op = db.Sequelize.Op;

const calculos = require("../../funcoes_utils/calculos/calculos");
const funcoes = require("../../funcoes_utils/funcoes/funcoes");

/**
 * Exports. para sempre "exportar" o resultado do que acontecer
 * A próxima palavra é sempre o que foi declarado nas routas, ou seja, é sua função que é chamada
 * (req, res) respectivamente é o requerimento e a response da API
 *
 * Os métodos chamados após a const Pessoa são nativos do Sequelize, na documentação terá a explicação de todos
 * o resto é apenas JS
 */
exports.findOne = async (req, res) => {
  if (!req.params.Documento) {
    resclea
      .status(406)
      .send({ message: "Documento inválido, por favor preencha novamente!" });
    return;
  }

  const pessoaDevedor = await Pessoas.findAll({
    where: {
      [Op.or]: [
        { JPesCNPJ: req.params.Documento },
        { FPesCPF: req.params.Documento },
      ],
    },
  })
    .then((data) => {
      if (data.length === 0) {
        res.status(406).send({ message: "Nenhuma Pessoa encontrada!" });
        return { Vazio: "" };
      } else {
        return {
          Pessoas_ID: data[0].Pessoas_ID,
          DevedorNome:
            data[0].PesTipoPessoa == "F"
              ? data[0].FPesNome
              : data[0].JPesRazaoSocial,
          DevedorDocumento:
            data[0].PesTipoPessoa == "F" ? data[0].FPesCPF : data[0].JPesCNPJ,
          DevedorApelido:
            data[0].PesTipoPessoa == "F"
              ? data[0].FPesApelido
              : data[0].JPesNomeFantasia,
        };
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message + " Algum erro aconteceu na busca do Devedor!",
      });
    });

  const devedorCredores = await Movimentacoes.findAll({
    where: {
      MoInadimplentesID: pessoaDevedor.Pessoas_ID,
      MoStatusMovimentacao: 0,
      MoOrigemMovimentacao: {
        [Op.in]: ["I", "C"],
      },
      MoValorDocumento: { [Op.ne]: 0.0 },
    },
    order: [
      ["MoInadimplentesID", "ASC"],
      ["MoClientesID", "ASC"],
    ],
    group: ["MoInadimplentesID", "MoClientesID"],
    attributes: ["MoInadimplentesID", "MoClientesID"],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message + " Algum erro aconteceu na busca dos Documentos!",
      });
    });

  var testeJson = JSON.parse(JSON.stringify(pessoaDevedor));

  for (let index = 0; index < devedorCredores.length; index++) {
    const element = await devedorCredores[index].MoClientesID;

    var dadosCredor = await Pessoas.findByPk(element)
      .then((data) => {
        if (!data) {
          res.status(406).send({ message: "Nenhuma Pessoa encontrada" });
          return { Vazio: "" };
        } else {
          return {
            CredorID: data.Pessoas_ID,
            CredorNome:
              data.PesTipoPessoa == "F" ? data.FPesNome : data.JPesRazaoSocial,
            CredorDocumento:
              data.PesTipoPessoa == "F" ? data.FPesCPF : data.JPesCNPJ,
            CredorApelido:
              data.PesTipoPessoa == "F"
                ? data.FPesApelido
                : data.JPesNomeFantasia,
          };
        }
      })
      .catch((err) => {
        res.status(500).json({
          message: err.message + " Algum erro aconteceu na busca dos Credores!",
        });
      });

    var politicas = await Politicas.findAll({
      where: {
        PePessoasID: dadosCredor.CredorID,
      },
    })
      .then((data) => {
        return data[0];
      })
      .catch((err) => {
        res.status(500).json({
          message:
            err.message +
            " Algum erro aconteceu na busca das Politicas de cobrança!",
        });
      });

    console.log("Jhon" + politicas.PeDescricao);

    var docs = await Movimentacoes.findAll({
      where: {
        MoInadimplentesID: pessoaDevedor.Pessoas_ID,
        MoClientesID: element,
        MoStatusMovimentacao: 0,
        MoOrigemMovimentacao: {
          [Op.in]: ["I", "C"],
        },
        MoValorDocumento: { [Op.ne]: 0.0 },
      },
      order: [
        ["MoInadimplentesID", "ASC"],
        ["MoClientesID", "ASC"],
        ["MoDataVencimento", "ASC"],
      ],
    })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        res.status(500).json({
          message:
            err.message + " Algum erro aconteceu na busca dos Documentos!",
        });
      });

    var docsAtualizados = await docs.map(async (docs) => {
      var indiceCorrecao = funcoes.RetornaIndiceTabela(
        docs.MoDataVencimento,
        politicas.PeTabelaIndicesEconomicosID,
        docs.Movimentacoes_ID
      );

      console.log(indiceCorrecao.TaIndice);
      return {
        Movimentacoes_ID: docs.Movimentacoes_ID,
        MoInadimplentesID: docs.MoInadimplentesID,
        MoClientesID: docs.MoClientesID,
        MoValorDocumento: docs.MoValorDocumento,
        MoDiasAtraso: funcoes.CalculaDias(
          funcoes.ArrumaData(docs.MoDataVencimento),
          funcoes.RetornaData()
        ),
        MoValorJuros: calculos.CalculaJuros(
          docs.MoValorDocumento,
          politicas.PeJuros,
          funcoes.CalculaDias(
            funcoes.ArrumaData(docs.MoDataVencimento),
            funcoes.RetornaData()
          ),
          politicas.PeTipoJuros == "" ? "S" : politicas.PeTipoJuros
        ),
        MoValorMulta: calculos.CalculaMulta(
          docs.MoValorDocumento,
          politicas.PeMulta
        ),
        MoValorCorrecao: 0,
        MoValorHonorarios: calculos.CalculaHonorarios(
          docs.MoValorDocumento,
          docs.MoPercentualHonorarios
        ),
        MoValorDocumentoAtualizado:
          docs.MoValorDocumento +
          calculos.CalculaJuros(
            docs.MoValorDocumento,
            docs.MoPercentualJuros,
            funcoes.CalculaDias(
              funcoes.ArrumaData(docs.MoDataVencimento),
              funcoes.RetornaData()
            ),
            "S"
          ) +
          calculos.CalculaMulta(docs.MoValorDocumento, docs.MoPercentualMulta) +
          calculos.CalculaCorrecao(
            docs.MoValorDocumento,
            docs.MoPercentualCorrecao
          ) +
          calculos.CalculaHonorarios(
            docs.MoValorDocumento,
            docs.MoPercentualHonorarios
          ),
        MoDataVencimento: docs.MoDataVencimento,
        MoNumeroDocumento: docs.MoNumeroDocumento,
        MoTipoDocumento: docs.MoTipoDocumento,
      };
    });

    var atualizaDocs = await docsAtualizados.map((docs) => {
      return docs.MoValorDocumento;
    });

    testeJson["CredorID" + index] = dadosCredor.CredorID;
    testeJson["CredorNome" + index] = dadosCredor.CredorNome;
    testeJson["CredorDocumento" + index] = dadosCredor.CredorDocumento;
    testeJson["CredorApelido" + index] = dadosCredor.CredorApelido;
    testeJson["ValorAtualizado" + index] = atualizaDocs.reduce(
      (a, b) => a + b,
      0
    );
    testeJson["ArrayDocs" + index] = docsAtualizados;
  }

  res.status(200).json(testeJson);
};
