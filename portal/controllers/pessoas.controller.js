const sequelize = require("sequelize");
const db = require("../models");
const Pessoas = db.pessoas;
const Movimentacoes = db.movimentacoes;
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
  if (!req.body.Documento) {
    res
      .status(406)
      .send({ message: "Documento inválido, por favor preencha novamente!" });
    return;
  }

  const pessoaDevedor = await Pessoas.findAll({
    where: {
      [Op.or]: [
        { JPesCNPJ: req.body.Documento },
        { FPesCPF: req.body.Documento },
      ],
    },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message + " Algum erro aconteceu na busca do Devedor!",
      });
    });

  const docsOriginais = await Movimentacoes.findAll({
    where: {
      MoInadimplentesID: pessoaDevedor[0].Pessoas_ID,
      MoStatusMovimentacao: 0,
      MoOrigemMovimentacao: {
        [Op.in]: ["I", "C"],
      },
      MoValorDocumento: { [Op.ne]: 0.0 },
    },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message + " Algum erro aconteceu na busca dos Documentos!",
      });
    });

  const docsAtualizados = await docsOriginais.map((docs) => {
    return {
      MoInadimplentesID: docs.MoInadimplentesID,
      MoClientesID: docs.MoClientesID,
      MoValorDocumento:
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

  const atualizaDocs = await docsAtualizados.map((docs) => {
    return docs.MoValorDocumento;
  });

  var arrayDocs = JSON.parse(JSON.stringify(docsAtualizados));
  arrayDocs["MoValorAtualizado"] = atualizaDocs.reduce((a, b) => a + b, 0);

  //   console.log(arrayDocs);

  //   [
  //     "DevedorNome"= "",
  //     "DevedorDocumento"= '',
  //     "CredorNome"= "",
  //     "CredorDocumento"="",
  //     "ValorAtualizado"="",
  //     "DocsAtualizados": {

  //     },
  //     "DevedorNome"= "",
  //     "DevedorDocumento"= '',
  //     "CredorNome"= "",
  //     "CredorDocumento"="",
  //     "ValorAtualizado"="",
  //     "DocsAtualizados": {

  //     }
  //   ]

  res.status(200).json(arrayDocs);
};
