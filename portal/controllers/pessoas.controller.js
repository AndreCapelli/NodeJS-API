const db = require("../models/index");
const sequelize = db.sequelize;
const { QueryTypes, json, IndexHints } = require("sequelize");
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

exports.atualizaEmail = async (req, res) => {
  var cpf = req.body.cpf;
  var email = req.body.email;
  var telefone = req.body.telefone;
  var contato = req.body.contato;
  var DDD;

  console.log(req.body.cpf);

  if (!cpf) {
    res
      .status(406)
      .json({ message: "Documento da pessoa nao pode ser vazio!" });
    return;
  }

  if (!email && !telefone) {
    res.status(406).json({ message: "Email e telefone nao informados!" });
    return;
  }

  if (telefone.length > 11 || telefone.length < 8) {
    res.status(406).json({ message: "Telefone de tamanho invalido!" });
    return;
  }

  if (telefone.length === 11 || telefone.length === 10) {
    DDD = telefone.substring(0, 2);
    telefone = telefone.substring(2, 50);
  }

  var pessoa = await Pessoas.findAll({
    where: {
      [Op.or]: [{ JPesCNPJ: cpf }, { FPesCPF: cpf }],
    },
  })
    .then((data) => {
      if (data.length === 0) {
        return res.status(406).send({ message: "Nenhuma Pessoa encontrada!" });
      } else {
        if (!contato) {
          contato =
            data[0].FPesNome === null
              ? data[0].JPesRazaoSocial
              : data[0].FPesNome;
        }
        return data[0];
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message + " Pessoa não localizada!",
      });
    });

  async function insereContato() {
    await sequelize
      .query(
        `INSERT INTO PessoasContatos (PesPessoasID, PesDDD, PesTelefone, PesEmail, PesOrigemContato, PesContato) 
        Values (${pessoa.Pessoas_ID},'${DDD}', '${telefone}','${email}','Portal','${contato}') `,
        {
          type: QueryTypes.INSERT,
        }
      )
      .catch((err) => {
        res.status(500).json({
          message: err.message + " Pessoa não localizada!",
        });
      });
    return;
  }

  await insereContato();
  res.status(200).send("Contato insereido com sucesso");
  return;
};

exports.findOne = async (req, res) => {
  if (!req.params.Documento) {
    res
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

  if (pessoaDevedor.Vazio == "") {
    res.status(406).send({ message: "Nenhuma Pessoa encontrada!" });
    return;
  }

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
      order: [["PePoliticaPrincipal", "DESC"]],
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

    console.log("Juros politica " + politicas.PeJuros);

    var docs = await Movimentacoes.findAll({
      where: {
        MoInadimplentesID: pessoaDevedor.Pessoas_ID,
        MoClientesID: element,
        MoStatusMovimentacao: 0,
        MoOrigemMovimentacao: {
          [Op.in]: ["I", "C"],
        },
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

    var docsAtualizados = await Promise.all(
      docs.map(async (docs) => {
        var indiceCorrecao = await funcoes.RetornaIndiceTabela(
          docs.MoDataVencimento,
          politicas.PeTabelaIndicesEconomicosID,
          docs.Movimentacoes_ID
        );

        let ValorCorrecaoReal = parseFloat(
          calculos.CalculaCorrecao(docs.MoValorDocumento, indiceCorrecao)
        );

        let ValorJurosReal = parseFloat(
          calculos.CalculaJuros(
            docs.MoValorDocumento +
              (politicas.PeBaseCalculoJuros == 1 ? ValorCorrecaoReal : 0),
            politicas.PeJuros,
            funcoes.CalculaDias(
              funcoes.ArrumaData(docs.MoDataVencimento),
              funcoes.RetornaData()
            ),
            politicas.PeTipoJuros == "" ? "S" : politicas.PeTipoJuros
          )
        );

        let ValorMultaReal = parseFloat(
          calculos.CalculaMulta(
            docs.MoValorDocumento + ValorCorrecaoReal,
            politicas.PeMulta
          )
        );

        let MoValorAtualizadoSemHonorario =
          docs.MoValorDocumento +
          ValorJurosReal +
          ValorMultaReal +
          ValorCorrecaoReal;

        if (politicas.PeHonorarioSobVA) {
          var ValorHonorarioReal = parseFloat(
            calculos.CalculaHonorarios(
              MoValorAtualizadoSemHonorario,
              politicas.PeHonorario
            )
          );
        } else {
          var ValorHonorarioReal = parseFloat(
            calculos.CalculaHonorarios(
              docs.MoValorDocumento,
              politicas.PeHonorario
            )
          );
        }

        let ValorHonorariosSobJuros =
          politicas.PeAplicaHonorario_Juros == true
            ? parseFloat(
                calculos.CalculaHonorarios(
                  ValorJurosReal,
                  politicas.PeHonorario
                )
              )
            : 0;

        let ValorHonorarioSobMulta =
          politicas.PeAplicaHonorario_Multa == true
            ? parseFloat(
                calculos.CalculaHonorarios(
                  ValorMultaReal,
                  politicas.PeHonorario
                )
              )
            : 0;

        let ValorHonorarioSobCorrecao =
          politicas.PeAplicaHonorario_Correcao == true
            ? parseFloat(
                calculos.CalculaHonorarios(
                  ValorCorrecaoReal,
                  politicas.PeHonorario
                )
              )
            : 0;

        let ValorHonorarioRealTotal =
          ValorHonorarioReal +
          ValorHonorarioSobCorrecao +
          ValorHonorarioSobMulta +
          ValorHonorariosSobJuros;

        let ValorAtualizadoTotal =
          docs.MoValorDocumento +
          ValorJurosReal +
          ValorMultaReal +
          ValorCorrecaoReal +
          ValorHonorarioRealTotal;

        return {
          Movimentacoes_ID: docs.Movimentacoes_ID,
          MoInadimplentesID: docs.MoInadimplentesID,
          MoClientesID: docs.MoClientesID,
          MoValorDocumento: docs.MoValorDocumento,
          MoCorrecaoIndice: indiceCorrecao,
          MoValorCorrecao: ValorCorrecaoReal,
          MoDiasAtraso: funcoes.CalculaDias(
            funcoes.ArrumaData(docs.MoDataVencimento),
            funcoes.RetornaData()
          ),
          MoJurosPorcentagem: politicas.PeJuros,
          MoValorJuros: ValorJurosReal,
          MoPorcentagemMulta: politicas.PeMulta,
          MoValorMulta: ValorMultaReal,
          MoValorAtualizadoSemHonorario:
            docs.MoValorDocumento +
            ValorJurosReal +
            ValorMultaReal +
            ValorCorrecaoReal,
          MoHonorariosPorcentagem: politicas.PeHonorario,
          MoValorHonorarios: ValorHonorarioReal,
          MoValorHonorarioSobJuros: ValorHonorariosSobJuros,
          MoValorHonorarioSobMulta: ValorHonorarioSobMulta,
          MoValorHonorarioSobCorrecao: ValorHonorarioSobCorrecao,
          MoValorHonorarioTotal: ValorHonorarioRealTotal,
          MoValorAtualizado: ValorAtualizadoTotal.toFixed(2),
          MoDataVencimento: docs.MoDataVencimento,
          MoNumeroDocumento: docs.MoNumeroDocumento,
          MoTipoDocumento: docs.MoTipoDocumento,
        };
      })
    );

    var atualizaDocs = await docsAtualizados.map((docs) => {
      return docs.MoValorDocumento;
    });

    testeJson["CredorID" + index] = dadosCredor.CredorID;
    testeJson["CredorNome" + index] = dadosCredor.CredorNome;
    testeJson["CredorDocumento" + index] = dadosCredor.CredorDocumento;
    testeJson["CredorApelido" + index] = dadosCredor.CredorApelido;
    testeJson["Politica" + index] = politicas.PeDescricao;
    testeJson["ValorAtualizado" + index] = atualizaDocs.reduce(
      (a, b) => a + b,
      0
    );
    testeJson["ArrayDocs" + index] = docsAtualizados;
  }

  res.status(200).json(testeJson);
};

exports.buscaCombo = async (req, res) => {
  if (!req.params.DocInad || !req.params.DocCli) {
    res
      .status(406)
      .send({ message: "Documento inválido, por favor preencha novamente!" });
    return;
  }

  const pessoaDevedor = await Pessoas.findAll({
    where: {
      [Op.or]: [
        { JPesCNPJ: req.params.DocInad },
        { FPesCPF: req.params.DocInad },
      ],
    },
  })
    .then((data) => {
      if (data.length === 0) {
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

  if (pessoaDevedor.Vazio == "") {
    res.status(406).send({ message: "Nenhuma Pessoa encontrada!" });
    return;
  }

  const pessoaCliente = await Pessoas.findAll({
    where: {
      [Op.or]: [
        { JPesCNPJ: req.params.DocCli },
        { FPesCPF: req.params.DocCli },
      ],
    },
  })
    .then((data) => {
      if (data.length === 0) {
        return { Vazio: "" };
      } else {
        return {
          Pessoas_ID: data[0].Pessoas_ID,
          CredorNome:
            data[0].PesTipoPessoa == "F"
              ? data[0].FPesNome
              : data[0].JPesRazaoSocial,
          CredorDocumento:
            data[0].PesTipoPessoa == "F" ? data[0].FPesCPF : data[0].JPesCNPJ,
          CredorApelido:
            data[0].PesTipoPessoa == "F"
              ? data[0].FPesApelido
              : data[0].JPesNomeFantasia,
        };
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message + " Algum erro aconteceu na busca do Credor!",
      });
    });

  if (pessoaCliente.Vazio == "") {
    res.status(406).send({ message: "Nenhum cliente encontrado!" });
    return;
  }

  const docs = await Movimentacoes.findAll({
    where: {
      MoInadimplentesID: pessoaDevedor.Pessoas_ID,
      MoClientesID: pessoaCliente.Pessoas_ID,
      MoStatusMovimentacao: 0,
      MoOrigemMovimentacao: {
        [Op.in]: ["I", "C"],
      },
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
        message: err.message + " Algum erro aconteceu na busca dos Documentos!",
      });
    });

  const combo = await Politicas.findAll({
    where: { PeComboPortal: true, PePessoasID: pessoaCliente.Pessoas_ID },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return { PessoasPoliticaCobrancas_ID: 0 };
    });

  if (combo.PessoasPoliticaCobrancas_ID)
    if (combo.PessoasPoliticaCobrancas_ID == 0) {
      res.status(406).send({ message: "Falha ao retornar as Políticas" });
      return;
    }

  let jsonDocs = JSON.parse(JSON.stringify(pessoaDevedor));
  jsonDocs["CredorID"] = pessoaCliente.Pessoas_ID;
  jsonDocs["CredorNome"] = pessoaCliente.CredorNome;
  jsonDocs["CredorDocumento"] = pessoaCliente.CredorDocumento;
  jsonDocs["CredorApelido"] = pessoaCliente.CredorApelido;

  var testeJson = [];

  for (let index = 0; index < combo.length; index++) {
    const element = combo[index];

    var docsAtualizados = await Promise.all(
      docs.map(async (docs) => {
        var indiceCorrecao = await funcoes.RetornaIndiceTabela(
          docs.MoDataVencimento,
          element.PeTabelaIndicesEconomicosID,
          docs.Movimentacoes_ID
        );

        let ValorCorrecaoReal = parseFloat(
          calculos.CalculaCorrecao(docs.MoValorDocumento, indiceCorrecao)
        );

        let ValorJurosReal = parseFloat(
          calculos.CalculaJuros(
            docs.MoValorDocumento +
              (element.PeBaseCalculoJuros == 1 ? ValorCorrecaoReal : 0),
            element.PeJuros,
            funcoes.CalculaDias(
              funcoes.ArrumaData(docs.MoDataVencimento),
              funcoes.RetornaData()
            ),
            element.PeTipoJuros == "" ? "S" : element.PeTipoJuros
          )
        );

        let ValorMultaReal = parseFloat(
          calculos.CalculaMulta(
            docs.MoValorDocumento + ValorCorrecaoReal,
            element.PeMulta
          )
        );

        let MoValorAtualizadoSemHonorario =
          docs.MoValorDocumento +
          ValorJurosReal +
          ValorMultaReal +
          ValorCorrecaoReal;

        if (element.PeHonorarioSobVA) {
          var ValorHonorarioReal = parseFloat(
            calculos.CalculaHonorarios(
              MoValorAtualizadoSemHonorario,
              element.PeHonorario
            )
          );
        } else {
          var ValorHonorarioReal = parseFloat(
            calculos.CalculaHonorarios(
              docs.MoValorDocumento,
              element.PeHonorario
            )
          );
        }

        let ValorHonorariosSobJuros =
          element.PeAplicaHonorario_Juros == true
            ? parseFloat(
                calculos.CalculaHonorarios(ValorJurosReal, element.PeHonorario)
              )
            : 0;

        let ValorHonorarioSobMulta =
          element.PeAplicaHonorario_Multa == true
            ? parseFloat(
                calculos.CalculaHonorarios(ValorMultaReal, element.PeHonorario)
              )
            : 0;

        let ValorHonorarioSobCorrecao =
          element.PeAplicaHonorario_Correcao == true
            ? parseFloat(
                calculos.CalculaHonorarios(
                  ValorCorrecaoReal,
                  element.PeHonorario
                )
              )
            : 0;

        let ValorHonorarioRealTotal =
          ValorHonorarioReal +
          ValorHonorarioSobCorrecao +
          ValorHonorarioSobMulta +
          ValorHonorariosSobJuros;

        let ValorAtualizadoTotal =
          docs.MoValorDocumento +
          ValorJurosReal +
          ValorMultaReal +
          ValorCorrecaoReal +
          ValorHonorarioRealTotal;

        let Desconto = element.PeDescontoMaximoPercent;

        console.log(Desconto);

        if (Desconto > 0) {
          var ValorFinal = (ValorAtualizadoTotal * Desconto) / 100;
        }

        return {
          ValorFinal: parseFloat(ValorFinal.toFixed(2)),
          ValorTotal: ValorAtualizadoTotal,
        };
      })
    );

    var atualizaDocs = await docsAtualizados.map((docs) => {
      return docs.ValorTotal;
    });

    var atualizaDocsDesconto = await docsAtualizados.map((docs) => {
      return docs.ValorFinal;
    });

    testeJson[index] = {
      PeNome: element.PeDescricao,
      ValorAtualizadoTotal: atualizaDocs.reduce((a, b) => a + b, 0).toFixed(2),
      DescontoPorcentagem: element.PeDescontoMaximoPercent,
      DescontoReal: atualizaDocsDesconto.reduce((a, b) => a + b, 0).toFixed(2),
      ValorFinal: (
        atualizaDocs.reduce((a, b) => a + b, 0) -
        atualizaDocsDesconto.reduce((a, b) => a + b, 0)
      ).toFixed(2),
      MaximoParcelas: element.PeQuantidadeMaxParcelas,
    };

    //var testeJson;
    //jhomaqui
  } // end for

  jsonDocs["Propostas"] = testeJson;
  res.status(200).json(jsonDocs);
};
