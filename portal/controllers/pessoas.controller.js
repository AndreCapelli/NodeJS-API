const db = require("../models/index");
const sequelize = db.sequelize;
const { QueryTypes, json, IndexHints } = require("sequelize");
const Pessoas = db.pessoas;
const Movimentacoes = db.movimentacoes;
const Politicas = db.politicas;
const Op = db.Sequelize.Op;

const https = require("https");
const fs = require("fs");

// const options = {
//   key: fs.readFileSync("path/to/private.key"),
//   cert: fs.readFileSync("path/to/certificate.crt"),
// };

const calculos = require("../../funcoes_utils/calculos/calculos");
const funcoes = require("../../funcoes_utils/funcoes/funcoes");
const { Sequelize } = require("../models/index");

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

  await sequelize
    .query(
      "INSERT INTO LogsPortalCobrancas (LoCPF, LoAcao, LoData, LoPessoasID) " +
        "Values('" +
        req.params.Documento +
        "','ATUALIZOU TELEFONE/ EMAIL" +
        DDD +
        " " +
        telefone +
        " " +
        email +
        "', GetDate()," +
        pessoa.Pessoas_ID +
        ")",
      { type: QueryTypes.INSERT }
    )
    .catch((err) => {
      console.log("Erro: " + err.message);
    });

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

  //registra logo
  await sequelize
    .query(
      "INSERT INTO LogsPortalCobrancas (LoCPF, LoAcao, LoData) " +
        "Values('" +
        req.params.Documento +
        "','SOLICITOU BUSCA DE DIVIDAS', GetDate()) ",
      { type: QueryTypes.INSERT }
    )
    .catch((err) => {
      console.log("Erro: " + err.message);
    });

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

    await sequelize
      .query(
        "INSERT INTO LogsPortalCobrancas (LoCPF, LoAcao, LoData) " +
          "Values('" +
          req.params.Documento +
          "','PESSOA NÃO ENCONTRADA', GetDate()) ",
        { type: QueryTypes.INSERT }
      )
      .catch((err) => {
        console.log("Erro: " + err.message);
      });

    return;
  }

  await sequelize
    .query(
      "INSERT INTO LogsPortalCobrancas (LoCPF, LoAcao, LoData, LoPessoasID) " +
        "Values('" +
        req.params.Documento +
        "','PESSOA LOCALIZADA', GetDate()," +
        pessoaDevedor.Pessoas_ID +
        ")",
      { type: QueryTypes.INSERT }
    )
    .catch((err) => {
      console.log("Erro: " + err.message);
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
        //PessoasPoliticaCobrancas_ID: 17833,
        PeDescricao: { [Op.not]: "NULL" },
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

    //  console.log("Juros politica " + politicas.PeJuros);

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

        var ValorCorrecaoReal;

        console.log("Indice Correcao " + indiceCorrecao);

        if (indiceCorrecao == 0) ValorCorrecaoReal = 0;
        else {
          ValorCorrecaoReal = parseFloat(
            calculos.CalculaCorrecao(docs.MoValorDocumento, indiceCorrecao)
          );
        }

        var ValorDocumento = parseFloat(docs.MoValorDocumento);
        console.log("ValorDoc " + ValorDocumento);
        console.log("baseCalculo " + politicas.PeBaseCalculoJuros);
        console.log("CorrecaoReal " + ValorCorrecaoReal);

        let ValorJurosReal = parseFloat(
          calculos.CalculaJuros(
            ValorDocumento +
              parseFloat(
                politicas.PeBaseCalculoJuros == 1 ? ValorCorrecaoReal : 0
              ),
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

        let MoValorAtualizadoSemHonorario = (
          docs.MoValorDocumento +
          ValorJurosReal +
          ValorMultaReal +
          ValorCorrecaoReal
        ).toFixed(2);

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
        console.log("valor atualizado total " + ValorAtualizadoTotal);

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
          MoValorAtualizadoSemHonorario: (
            docs.MoValorDocumento +
            ValorJurosReal +
            ValorMultaReal +
            ValorCorrecaoReal
          ).toFixed(2),
          MoHonorariosPorcentagem: politicas.PeHonorario,
          MoValorHonorarios: ValorHonorarioReal,
          MoValorHonorarioSobJuros: ValorHonorariosSobJuros,
          MoValorHonorarioSobMulta: ValorHonorarioSobMulta,
          MoValorHonorarioSobCorrecao: ValorHonorarioSobCorrecao,
          MoValorHonorarioTotal: ValorHonorarioRealTotal.toFixed(2),

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

    var valorAtual = await docsAtualizados.map((docs) => {
      return parseFloat(docs.MoValorAtualizado);
    });

    testeJson["CredorID" + index] = dadosCredor.CredorID;
    testeJson["CredorNome" + index] = dadosCredor.CredorNome;
    testeJson["CredorDocumento" + index] = dadosCredor.CredorDocumento;
    testeJson["CredorApelido" + index] = dadosCredor.CredorApelido;
    testeJson["Politica" + index] = politicas.PeDescricao;
    testeJson["ValorAtualizado" + index] = atualizaDocs
      .reduce((a, b) => a + b, 0)
      .toFixed(2);
    testeJson["QuantidadeDocs" + index + "_" + dadosCredor.CredorID] =
      docsAtualizados.length;
    testeJson["ValorAtualizadoVerdadeiro" + index] = valorAtual
      .reduce((a, b) => a + b, 0)
      .toFixed(2);
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

  await sequelize
    .query(
      "INSERT INTO LogsPortalCobrancas (LoCPF, LoAcao, LoData, LoPessoasID) " +
        "Values('" +
        req.params.Documento +
        "','BUSCOU COMBOS" +
        req.params.JPesCNPJ +
        "', GetDate()," +
        pessoaDevedor.Pessoas_ID +
        ")",
      { type: QueryTypes.INSERT }
    )
    .catch((err) => {
      console.log("Erro: " + err.message);
    });

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
  var DocumentosID = "";

  for (let index = 0; index < combo.length; index++) {
    const element = combo[index];

    var docsAtualizados = await Promise.all(
      docs.map(async (docs) => {
        var indiceCorrecao = await funcoes.RetornaIndiceTabela(
          docs.MoDataVencimento,
          element.PeTabelaIndicesEconomicosID,
          docs.Movimentacoes_ID
        );

        var ValorCorrecaoReal;
        if (indiceCorrecao == 0) ValorCorrecaoReal = 0;
        else {
          ValorCorrecaoReal = parseFloat(
            calculos.CalculaCorrecao(docs.MoValorDocumento, indiceCorrecao)
          );
        }

        let ValorOriginalSemCalc = docs.MoValorDocumento;

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

        if (Desconto == null) Desconto = 0;

        console.log("desconto " + Desconto);

        if (Desconto > 0) {
          var ValorFinal = parseFloat((ValorAtualizadoTotal * Desconto) / 100);
          console.log("valor final " + ValorFinal);
        } else ValorFinal = 0;

        if (index == 0) {
          if (DocumentosID == "") DocumentosID = docs.Movimentacoes_ID;
          else DocumentosID = DocumentosID + "," + docs.Movimentacoes_ID;
        }

        //teste
        return {
          ValorFinal: parseFloat(ValorFinal),
          ValorTotal: ValorAtualizadoTotal,
          ValorOriginalSemCalc: ValorOriginalSemCalc,
          ValorTotalJuros: ValorJurosReal,
          ValorTotalMulta: ValorMultaReal,
          ValorTotalCorrecao: ValorCorrecaoReal,
          ValorTotalHonorarios: ValorHonorarioRealTotal,
        };
      })
    );

    var atualizaDocs = await docsAtualizados.map((docs) => {
      return docs.ValorTotal;
    });

    var atualizaDocsDesconto = await docsAtualizados.map((docs) => {
      return docs.ValorFinal;
    });

    var atualizaDocsOriginalSemCalc = await docsAtualizados.map((docs) => {
      return docs.ValorOriginalSemCalc;
    });

    var atualizaDocsTotalJuros = await docsAtualizados.map((docs) => {
      return docs.ValorTotalJuros;
    });

    var atualizaDocsTotalMulta = await docsAtualizados.map((docs) => {
      return docs.ValorTotalMulta;
    });

    var atualizaDocsTotalCorrecao = await docsAtualizados.map((docs) => {
      return docs.ValorTotalCorrecao;
    });
    var atualizaDocsTotalHonorarios = await docsAtualizados.map((docs) => {
      return docs.ValorTotalHonorarios;
    });

    testeJson[index] = {
      PropostaID: element.PessoasPoliticaCobrancas_ID,
      DiasDataPrimeiraParcela: 5,
      PeNome: element.PeDescricao,
      ValorAtualizadoTotal: atualizaDocs.reduce((a, b) => a + b, 0).toFixed(2),
      DescontoPorcentagem: element.PeDescontoMaximoPercent,
      DescontoReal: atualizaDocsDesconto.reduce((a, b) => a + b, 0).toFixed(2),
      ValorFinal: (
        atualizaDocs.reduce((a, b) => a + b, 0) -
        atualizaDocsDesconto.reduce((a, b) => a + b, 0)
      ).toFixed(2),
      ValorOriginalSemCalc: atualizaDocsOriginalSemCalc
        .reduce((a, b) => a + b, 0)
        .toFixed(2),

      ValorTotalJuros: atualizaDocsTotalJuros
        .reduce((a, b) => a + b, 0)
        .toFixed(2),

      ValorTotalMulta: atualizaDocsTotalMulta
        .reduce((a, b) => a + b, 0)
        .toFixed(2),

      ValorTotalCorrecao: atualizaDocsTotalCorrecao
        .reduce((a, b) => a + b, 0)
        .toFixed(2),

      ValorTotalHonorarios: atualizaDocsTotalHonorarios
        .reduce((a, b) => a + b, 0)
        .toFixed(2),
      MaximoParcelas: element.PeQuantidadeMaxParcelas,
    };

    // console.log(docsAtualizados.Movimentacoes_ID);

    //var testeJson;
    //jhomaqui
  } // end for

  jsonDocs["Documentos"] = DocumentosID;
  jsonDocs["Propostas"] = testeJson;
  res.status(200).json(jsonDocs);
};

exports.RealizaAcordo = async (req, res) => {
  var UsuarioCobrador;
  var ClienteID, InadimplenteID, CampanhaID, CampanhaCodigo, PoliticaID;

  ClienteID = req.body.clienteid;
  InadimplenteID = req.body.devedorid;
  Documentos = req.body.documentos;
  PoliticaID = req.body.propostaid;

  var Erro = false;

  if (!ClienteID) {
    res.status(406).json({ message: "Cliente não informado!" });
    return;
  }

  if (!InadimplenteID) {
    res.status(406).json({ message: "Devedor não informado!" });
    return;
  }

  if (!Documentos) {
    res.status(406).json({ message: "Documento não informado!" });
    return;
  }

  // Trata usuario cobrador
  await sequelize
    .query(
      `select MoUsuariosID from Movimentacoes WITH(NOLOCK) Where Movimentacoes_ID IN(${Documentos})`,
      {
        type: QueryTypes.SELECT,
      }
    )
    .then((data) => {
      if (data.length === 0) {
        res.status(400).send({ mensagem: "Movimentações não encontradas" });
      } else {
        UsuarioCobrador = data[0].MoUsuariosID;
      }
    })
    .catch((err) => {
      UsuarioCobrador = "";
    });

  if ((UsuarioCobrador = "null")) {
    //nao achou usuario, pego o proprietario da ficha...
    await sequelize
      .query(
        `select PesOperadorProprietarioID from Pessoas WITH(NOLOCK) Where Pessoas_ID = (${InadimplenteID})`,
        {
          type: QueryTypes.SELECT,
        }
      )
      .then((data) => {
        if (data.length === 0) {
          res.status(400).send({ mensagem: "Nenhum registro encontrado" });
        } else {
          UsuarioCobrador = data[0].PesOperadorProprietarioID;
        }
      })
      .catch((err) => {
        UsuarioCobrador = "";
      });
  }

  var politicas = await Politicas.findAll({
    where: {
      PessoasPoliticaCobrancas_ID: PoliticaID,
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

  const docs = await sequelize
    .query(
      `select *
        from Movimentacoes WITH(NOLOCK) Where Movimentacoes_ID IN(${Documentos})`,
      {
        type: QueryTypes.SELECT,
      }
    )
    .then((data) => {
      if (data.length === 0) {
        res.status(400).send({ mensagem: "Nenhum registro encontrado" });
      } else {
        CampanhaCodigo = data[0].MoCodigoCampanha;
        CampanhaID = data[0].MoCampanhasID;
        return data;
      }
    })
    .catch((err) => {
      res.status(400).send({
        mensagem: "Erro ao localizar movimentações! " + err.message,
      });
    });

  if (CampanhaCodigo == "") CampanhaCodigo = "NULL";

  if (CampanhaID == "") CampanhaID = "NULL";

  var docsAtualizados = await Promise.all(
    docs.map(async (docs) => {
      var indiceCorrecao = await funcoes.RetornaIndiceTabela(
        docs.MoDataVencimento,
        politicas.PeTabelaIndicesEconomicosID,
        docs.Movimentacoes_ID
      );

      let indID = politicas.PeTabelaIndicesEconomicosID;

      let ValorCorrecaoReal = parseFloat(
        calculos.CalculaCorrecao(docs.MoValorDocumento, indiceCorrecao)
      );

      let ValorOriginalSemCalc = docs.MoValorDocumento;

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
              calculos.CalculaHonorarios(ValorJurosReal, politicas.PeHonorario)
            )
          : 0;

      let ValorHonorarioSobMulta =
        politicas.PeAplicaHonorario_Multa == true
          ? parseFloat(
              calculos.CalculaHonorarios(ValorMultaReal, politicas.PeHonorario)
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

      let ValorAtualizadoTotal = (
        parseFloat(docs.MoValorDocumento) +
        parseFloat(ValorJurosReal) +
        parseFloat(ValorMultaReal) +
        parseFloat(ValorCorrecaoReal) +
        parseFloat(ValorHonorarioRealTotal)
      ).toFixed(2);

      console.log("Total sem honorarios : " + ValorAtualizadoTotal);

      let Desconto = politicas.PeDescontoMaximoPercent;

      if (Desconto > 0) {
        var ValorDesconto = (ValorAtualizadoTotal * Desconto) / 100;
      }

      let ValorFinalComDesconto = (
        ValorAtualizadoTotal - ValorDesconto
      ).toFixed(2);

      var MovId = docs.Movimentacoes_ID;

      return {
        Id: MovId,
        JurosReal: ValorJurosReal,
        MultaReal: ValorMultaReal,
        CorrecaoReal: ValorCorrecaoReal,
        HonorarioReal: ValorHonorarioReal,
        IndiceCorrecao: indiceCorrecao,
        HJR: ValorHonorariosSobJuros,
        HMR: ValorHonorarioSobMulta,
        HCR: ValorHonorarioSobCorrecao,
        IndiceID: indID,
        DescontoReal: ValorDesconto,
        DescontoPercent: Desconto,
        DiasAtraso: funcoes.CalculaDias(
          funcoes.ArrumaData(docs.MoDataVencimento),
          funcoes.RetornaData()
        ),
        ValorFinal: parseFloat(ValorFinalComDesconto),
        ValorTotal: ValorFinalComDesconto,
        ValorOriginalSemCalc: ValorOriginalSemCalc,
        ValorTotalJuros: ValorJurosReal,
        ValorTotalMulta: ValorMultaReal,
        ValorTotalCorrecao: ValorCorrecaoReal,
        ValorTotalHonorarios: ValorHonorarioRealTotal,
      };
    })
  );

  var atualizaDocs = await docsAtualizados.map((docs) => {
    return parseFloat(docs.ValorTotal);
  });

  var atualizaDocsDesconto = await docsAtualizados.map((docs) => {
    return parseFloat(docs.DescontoReal);
  });

  var atualizaDocsOriginalSemCalc = await docsAtualizados.map((docs) => {
    return docs.ValorOriginalSemCalc;
  });

  var atualizaDocsTotalJuros = await docsAtualizados.map((docs) => {
    return docs.ValorTotalJuros;
  });

  var atualizaDocsTotalMulta = await docsAtualizados.map((docs) => {
    return docs.ValorTotalMulta;
  });

  var atualizaDocsTotalCorrecao = await docsAtualizados.map((docs) => {
    return docs.ValorTotalCorrecao;
  });

  var atualizaDocsTotalHonorarios = await docsAtualizados.map((docs) => {
    return docs.ValorTotalHonorarios;
  });

  var atualizaDocsTotalComDesconto = await docsAtualizados.map((docs) => {
    return docs.ValorFinal;
  });

  let OriginalSemCalc = atualizaDocsOriginalSemCalc.reduce((a, b) => a + b, 0);
  let TotalJuros = atualizaDocsTotalJuros.reduce((a, b) => a + b, 0);
  let TotalMulta = atualizaDocsTotalMulta.reduce((a, b) => a + b, 0);
  let TotalCorrecao = atualizaDocsTotalCorrecao.reduce((a, b) => a + b, 0);
  let TotalHonorarios = atualizaDocsTotalHonorarios.reduce((a, b) => a + b, 0);
  let DescontoReal = atualizaDocsDesconto.reduce((a, b) => a + b, 0);
  let ValorFinal = atualizaDocsTotalComDesconto.reduce((a, b) => a + b, 0);

  console.log("Valor Desconto: " + DescontoReal);
  console.log("Valor final: " + ValorFinal);

  var sql = `SET dateformat dmy INSERT INTO MovimentacoesAcordos (MoUsuariosID, MoParcelas, moValorOriginalSemCalc, moValorDesconto,  
    moPorcentagemDesconto,MoValorTotalJuros,MoTotalHonorarios,MoValorTotalMulta,
    MoValorOriginal, MoClientesID, MoInadimplentesID, MoCampanhasID, MoCodigoCampanha,
    MoValorTotalParcelas, MoDataPrimeiraParcela, MoDataUltimaParcela,
    MoTabelaIndicesEconomicosID, MoPessoasPoliticaCobrancasID, MoSaldoDevedor,
    MoTotalCorrecao, MoOrigemAcordo) VALUES((SELECT TOP 1 Usuarios_ID FROM USUARIOS Where USNome='CALLTECH'),
    ${politicas.PeQuantidadeMaxParcelas},'${OriginalSemCalc.toFixed(
    2
  )}','${DescontoReal.toFixed(2)}','${
    politicas.PeDescontoMaximoPercent
  }','${TotalJuros.toFixed(2)}','${TotalHonorarios.toFixed(
    2
  )}','${TotalMulta.toFixed(2)}','${parseFloat(ValorFinal).toFixed(
    2
  )}',${ClienteID},${InadimplenteID},${CampanhaID},'${CampanhaCodigo}','${parseFloat(
    ValorFinal
  ).toFixed(2)}','${req.body.primeiro_venc}','${req.body.ultimo_venc}',${
    politicas.PeTabelaIndicesEconomicosID == 0
      ? "NULL"
      : politicas.PeTabelaIndicesEconomicosID
  },${politicas.PessoasPoliticaCobrancas_ID}, '${parseFloat(ValorFinal).toFixed(
    2
  )}','${TotalCorrecao.toFixed(2)}','PORTAL')`;

  await sequelize.query(sql, { type: QueryTypes.INSERT }).catch((err) => {
    res.send({ erro: err.message }).status(400);
    console.log("Erro: " + err.message);
    Erro = true;
    return;
  });

  if (Erro) return;

  var AcordoID;
  await sequelize
    .query(`SELECT IDENT_CURRENT('MovimentacoesAcordos') Acordo`, {
      type: QueryTypes.SELECT,
    })
    .then((data) => {
      if (data.length === 0) {
        res.status(400).send({ mensagem: "Nenhum registro encontrado" });
      } else {
        AcordoID = data[0].Acordo;
      }
    })
    .catch((err) => {
      res.status(400).send({
        mensagem: "Erro ao localizar Acordo! " + err.message,
      });
    });

  await sequelize
    .query(
      "set dateformat dmy  INSERT INTO MovimentacoesAcordosLogs (MoUsuariosID, MoAcao, " +
        "MoForm, MoRotina, MoTabela, MoMovimentacoesAcordosID)" +
        "VALUES((SELECT Usuarios_ID From Usuarios With(NOLOCK) Where UsNome = 'CALLTECH' )," +
        "'Criou acordo via portal', 'API - MaxSmart', 'Post - RealizaAcordos', 'MovimentacoesAcordos', " +
        AcordoID +
        ")",
      { type: QueryTypes.INSERT }
    )
    .catch((err) => {
      res.status(400).send({ erro: err.message });
    });

  //movimentacoesAcordosDocumentos

  for (let index = 0; index < docs.length; index++) {
    const element = docs[index];

    await sequelize
      .query(
        "set dateformat dmy  INSERT INTO MovimentacoesAcordosDocumentos (MoMovimentacoesAcordosID, MoMovimentacoesID, MoTipoDocumento) " +
          "values(" +
          AcordoID +
          "," +
          element.Movimentacoes_ID +
          ",'O')",
        { type: QueryTypes.INSERT }
      )
      .catch((err) => {
        res.status(400).send({ erro: err.message });
      });

    await sequelize
      .query(
        "UPDATE Movimentacoes SET MoDestinoAcordoID=" +
          AcordoID +
          ", MoStatusMovimentacao = 1 Where Movimentacoes_ID=" +
          element.Movimentacoes_ID,
        { type: QueryTypes.UPDATE }
      )
      .catch((err) => {
        res.status(400).send({ erro: err.message });
      });
  }

  var ValorParcela = (ValorFinal / politicas.PeQuantidadeMaxParcelas).toFixed(
    2
  );

  for (
    let parcelas = 0;
    parcelas < politicas.PeQuantidadeMaxParcelas;
    parcelas++
  ) {
    var dtf = req.body.primeiro_venc;

    if (parcelas > 0) dtf = funcoes.IncMonth(dtf, parcelas);

    console.log(dtf);

    sql = "";
    sql =
      "SET dateformat DMY INSERT INTO MOVIMENTACOES (MoUsuarioCriadorID, MoUsuariosID," +
      "MoOrigemMovimentacao, MoInadimplentesID," +
      "MoClientesID, MoTipoDocumento, MoValorAcordoSemCalc,MoNumeroDocumento," +
      "MoValorDocumento, MoValorOriginalParcela ,MoDataVencimento, MoIdentificacaoAcordo, MoParcela, MoStatusMovimentacao," +
      "MoMovimentacoesAcordosID, MoCampanhasID, MoCodigoCampanha, MoValorParcelaOriginal)" +
      "Values((SELECT USUARIOS_ID FROM USUARIOS WITH(NOLOCK) WHERE USNOME = 'CALLTECH')," +
      UsuarioCobrador +
      "," +
      "'A'," +
      InadimplenteID +
      "," +
      ClienteID +
      ", 'PARCELA - PORTAL'" +
      ",'" +
      ValorParcela +
      "'," +
      "'AC- " +
      AcordoID +
      "','" +
      ValorParcela +
      "','" +
      ValorParcela +
      "','" +
      dtf +
      "','AC- " +
      AcordoID +
      "/" +
      (parcelas + 1) +
      "'," +
      (parcelas + 1) +
      ",0," +
      AcordoID +
      "," +
      CampanhaID +
      ",'" +
      CampanhaCodigo +
      "','" +
      ValorParcela +
      "')";

    await sequelize.query(sql, { type: QueryTypes.INSERT }).catch((err) => {
      res.status(400).send({ erro: err.message });
    });

    var MovimentacaoID;
    await sequelize
      .query(`SELECT IDENT_CURRENT('Movimentacoes') ID`, {
        type: QueryTypes.SELECT,
      })
      .then((data) => {
        if (data.length === 0) {
          res.status(400).send({ mensagem: "Nenhum registro encontrado" });
        } else {
          MovimentacaoID = data[0].ID;
        }
      })
      .catch((err) => {
        res.status(400).send({
          mensagem: "Erro ao localizar Movimentacao! " + err.message,
        });
      });

    await sequelize
      .query(
        "INSERT INTO MovimentacoesAcordosLogs (MoUsuariosID, MoAcao, MoForm, MoRotina, " +
          "MoTabela, MoMovimentacoesAcordosID, MoMovimentacoesID)" +
          " VALUES((SELECT Usuarios_ID From Usuarios With(NOLOCK) Where UsNome = 'CALLTECH' ),'Criou movimentacao via portal','API','Post - RealizaAcordo', 'Movimentacoes'," +
          AcordoID +
          "," +
          MovimentacaoID +
          ")",
        { type: QueryTypes.INSERT }
      )
      .catch((err) => {
        res.status(400).send({ erro: err.message });
      });
  }

  for (let index = 0; index < docsAtualizados.length; index++) {
    sql =
      "INSERT INTO MovimentacoesPoliticasDeCobranca (MovimentacoesID,MoPoDiaAtraso,MoPoJurosP,MoPoJurosR,MoPoMultaP" +
      ",MoPoMultaR,MoPoHonorarioP,MoPoHonorarioR, MoPoCorrecaoP,MoPoCorrecaoR,MoPoHonorarioJurosR" +
      ",MoPoHonorarioMultaR, MoPoHonorarioCorrecaoR, MoPoValorAtualizado, MoTabelaIndicesEconomicosID, MoDescontoReal, MoDescontoPercent)";

    sql =
      sql +
      "Values(" +
      docsAtualizados[index].Id +
      "," +
      docsAtualizados[index].DiasAtraso +
      ",'" +
      politicas.PeJuros +
      "','" +
      docsAtualizados[index].JurosReal +
      "','" +
      politicas.PeMulta +
      "','" +
      docsAtualizados[index].MultaReal +
      "','" +
      politicas.PeHonorario +
      "','" +
      docsAtualizados[index].HonorarioReal +
      "','" +
      docsAtualizados[index].IndiceCorrecao +
      "','" +
      docsAtualizados[index].CorrecaoReal +
      "','" +
      docsAtualizados[index].HJR +
      "','" +
      docsAtualizados[index].HMR +
      "','" +
      docsAtualizados[index].HCR +
      "','" +
      docsAtualizados[index].ValorTotal +
      "'," +
      docsAtualizados[index].IndiceID +
      ",'" +
      docsAtualizados[index].DescontoReal +
      "','" +
      docsAtualizados[index].DescontoPercent +
      "')";

    await sequelize.query(sql, { type: QueryTypes.INSERT }).catch((err) => {
      res.status(400).send({ erro: err.message });
    });

    if (Erro) return;
  }

  await sequelize
    .query(
      "INSERT INTO LogsPortalCobrancas (LoCPF, LoAcao, LoData, LoPessoasID) " +
        "Values('" +
        req.params.Documento +
        "','Realizou Acordo Nº " +
        AcordoID +
        " ClienteID: " +
        ClienteID +
        "', GetDate()," +
        InadimplenteID +
        ")",
      { type: QueryTypes.INSERT }
    )
    .catch((err) => {
      console.log("Erro: " + err.message);
    });

  res.send("" + AcordoID).status(200);
};

exports.johnTeste = async (req, res) => {
  var docs = await sequelize
    .query(
      `select *
      from Movimentacoes WITH(NOLOCK) Where Movimentacoes_ID IN(${req.params.Documentos})`,
      {
        type: QueryTypes.SELECT,
      }
    )
    .then((data) => {
      if (data.length === 0) {
        res.status(400).send({ mensagem: "Nenhum registro encontrado" });
      } else {
        ClienteID = data[0].MoClientesID;
        InadimplenteID = data[0].MoInadimplentesID;
        CampanhaID = data[0].MoCampanhasID;
        CampanhaCodigo = data[0].MoCodigoCampanha;
        return data;
      }
    })
    .catch((err) => {
      res.status(400).send({
        mensagem: "Erro ao localizar Cliente/ Devedor! " + err.message,
      });
    }); // fim tratativa cliente/ devedor

  calculos.AtualizaDocumento(docs[0].Movimentacoes_ID, 2);

  // var docsAtualizados = await Promise.all(
  //   docs.map(async (docs) => {
  //     console.log(docs.Movimentacoes_ID);
  //     calculos.AtualizaDocumento(docs.Movimentacoes_ID);
  //   })
  // );

  res.send("oi").status(200);
};
