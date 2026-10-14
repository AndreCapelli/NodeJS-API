require("dotenv").config();
const db = require("../models/index");
const sequelize = db.sequelize;
const { QueryTypes, json, IndexHints, where } = require("sequelize");
const Pessoas = db.pessoas;
const PessoasContatos = db.pessoasContatos;
const Movimentacoes = db.movimentacoes;
const Politicas = db.politicas;
const Op = db.Sequelize.Op;
const Firebird = require('node-firebird');

const fbOptions = {
  host: '200.150.198.251',
  port: 3050,
  database: 'C:\\Toth\\TOTH.FDB',
  user: 'SYSDBA',
  password: 'masterkey',
  lowercase_keys: false,
  role: null,
  pageSize: 4096,
};

const https = require("https");
const fs = require("fs");
const path = require("path");
const sql = require('mssql');


// const options = {
//   key: fs.readFileSync("path/to/private.key"),
//   cert: fs.readFileSync("path/to/certificate.crt"),
// };

const calculos = require("../../funcoes_utils/calculos/calculos");
const funcoes = require("../../funcoes_utils/funcoes/funcoes");
const tendaService = require("../services/tenda.service");
const { Sequelize } = require("../models/index");

/**
 * Gera um texto não ambíguo aceito pelas colunas datetime do SQL Server.
 * A aplicação trabalha no fuso -03:00; por isso deslocamos o instante e usamos
 * os componentes UTC para preservar o horário local recebido pela API.
 * Exemplo: 2026-09-23T10:39:00-03:00 -> 20260923 10:39:00.000.
 */
function formatarDataSqlServer(data) {
  const dataNoFusoAplicacao = new Date(data.getTime() - (3 * 60 * 60 * 1000));
  const ano = dataNoFusoAplicacao.getUTCFullYear();
  const mes = String(dataNoFusoAplicacao.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(dataNoFusoAplicacao.getUTCDate()).padStart(2, '0');
  const hora = String(dataNoFusoAplicacao.getUTCHours()).padStart(2, '0');
  const minuto = String(dataNoFusoAplicacao.getUTCMinutes()).padStart(2, '0');
  const segundo = String(dataNoFusoAplicacao.getUTCSeconds()).padStart(2, '0');
  const milissegundo = String(dataNoFusoAplicacao.getUTCMilliseconds()).padStart(3, '0');

  return `${ano}${mes}${dia} ${hora}:${minuto}:${segundo}.${milissegundo}`;
}

/**
 * Exports. para sempre "exportar" o resultado do que acontecer
 * A próxima palavra é sempre o que foi declarado nas routas, ou seja, é sua função que é chamada
 * (req, res) respectivamente é o requerimento e a response da API
 *
 * Os métodos chamados após a const Pessoa são nativos do Sequelize, na documentação terá a explicação de todos
 * o resto é apenas JS
 */

exports.retornaCalltechOficial = async (req, res) => {
  try {
    const dados = {
      Servidor: "200.150.198.251",
      Usuario: "sa",
      Senha: "vbu'eoA A63",
      Base: "Calltech_Oficial",
      Host: "147.93.38.1",
      SenhaFTP: "k&4-@vBWFv0,",
      UsuarioFTP: "u942651173",
      CaminhoFTP: "/Atualizador"
    };

    res.status(200).json(dados);
  } catch (error) {
    console.error("Erro ao retornar dados da Calltech Oficial:", error);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};



exports.novoProtocolo = async (req, res) => {

  const pessoaID = req.body.idCliente;
  const telefone = req.body.telefone;
  const protocolo = req.body.protocolo;
  const link = req.body.linkAcesso;

  var contatoID;


  //Valida se a pessoa existe
  const existentPessoa = await Pessoas.findOne({
    where: {
      Pessoas_ID: pessoaID,
    },
  });

  if (!existentPessoa) {
    res.status(404).send("Pessoa não encontrada!");
    return
  }


  // Verifica se o registro já existe
  const existentRecord = await PessoasContatos.findOne({
    where: {
      PesPessoasID: pessoaID,
      PesTelefone: telefone.substring(2, 50),
    },
  });


  if (!existentRecord) {
    // Se não existir, insere um novo registro
    await PessoasContatos.create({
      PesPessoasID: pessoaID,
      PesDDD: telefone.substring(0, 2),
      PesTelefone: telefone.substring(2, 50),
      PesOrigemContato: 'HyperWhats',
    });

    //pega o id
    await PessoasContatos.findOne({
      where: {
        PesPessoasID: pessoaID,
        PesTelefone: telefone.substring(2, 50),
      },
    }).then((pessoaContato) => {
      if (pessoaContato) {
        console.log('achou o contato - ' + pessoaContato.PessoasContatos_ID)
        contatoID = pessoaContato.PessoasContatos_ID;
        // Faça o que precisa com o campo retornado
      } else {
        console.log('Nenhum resultado encontrado');
      }
    }).catch((err) => {
      console.error('Erro ao executar a consulta:', err);
    });

    console.log('Contato inserido - ID:' + contatoID)

  } else {
    contatoID = existentRecord.PessoasContatos_ID;
    // Se existir, atualiza o registro existente
    await PessoasContatos.update({
      PesDDD: telefone.substring(0, 2),
      PesTelefone: telefone.substring(2, 50),
    }, {
      where: {
        PesPessoasID: pessoaID,
        PesTelefone: telefone.substring(2, 50),
      },
    });
    console.log('Contato atualizado')
  }

  //insere na tabela de integrações, caso não exista
  await sequelize.query(
    `SELECT * FROM integracoes_HyperFlow Where inPessoasID = :PessoaID AND inProtocolo =:Protocolo  `,
    {
      type: QueryTypes.SELECT,
      replacements: {
        PessoaID: pessoaID,
        Protocolo: protocolo
      },
    }
  ).then((registros) => {
    if (registros.length === 0) {
      console.log('Nenhum registro encontrado - Vai inserir um novo protocolo');
      sequelize
        .query(
          "INSERT INTO integracoes_HyperFlow (inPessoasID, inPessoasContatosID, inTelefone, inProtocolo, inLink) " +
          "Values(:PessoaID, :ContatoID, :Telefone, :Protocolo, :Link)",
          {
            type: QueryTypes.INSERT,
            replacements: {
              PessoaID: pessoaID,
              ContatoID: contatoID,
              Telefone: telefone,
              Protocolo: protocolo,
              Link: link
            }
          }
        )
        .catch((err) => {
          console.log("Erro: " + err.message);
        });
    }
    else
      console.log('Protocolo ' + protocolo + ' já existe na base')
  }).catch((err) => {
    console.error('Erro ao executar a consulta:', err);
  });


  res.status(200).send("Protocolo recebido e salvo!");




  // const lead = JSON.parse(JSON.stringify(req.body));
  // const diretorio = path.basename(__dirname);

  // console.log('pasta: ' + __dirname);

  // const fileName = "NovoProtocolo" + Math.floor(Math.random() * 1000000) + ".txt";
  // const filePath = path.join(__dirname, fileName);

  // fs.writeFile(
  //   filePath,
  //   JSON.stringify(req.body),
  //   (err) => {
  //     if (err) {
  //       console.error("Falha ao gerar protocolo:", err);
  //       res.status(500).send("Erro ao gerar protocolo!");
  //       return;
  //     }

  //     console.log("Protocolo gerado com sucesso em:", filePath);
  //     res.status(200).send("Protocolo recebido e salvo!");
  //   }
  // );
};

exports.buscaDevedorTelefone = async (req, res) => {

  var Documento = req.params.Document
  var whereCondicao;

  whereCondicao = sequelize.literal(`
  Pessoas_ID IN (
      SELECT PesPessoasID 
      FROM PessoasContatos With(NOLOCK) 
      Where ISNULL(PesDDD,'') + ISNULL(PesTelefone,'') = '${Documento}'
  )
`);

  pessoaDevedor = await Pessoas.findAll({
    where: whereCondicao,
  })
    .then((data) => {
      if (data.length == 0) {
        return { Vazio: "" };
      } else {
        return data
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message + " Algum erro aconteceu na busca do Devedor!",
      });
      return;
    });




  if (pessoaDevedor.Vazio !== undefined) {
    res.status(200).json({
      message: "Operação bem sucedida mas nenhum devedor encontrado!",
    });
    return;
  }
  else {
    res.status(200).json(pessoaDevedor);
  }

};

exports.buscaDevedor = async (req, res) => {


  var tipo = req.params.Type;
  var Documento = req.params.Document

  var pessoaDevedor;
  var whereCondicao;

  if (tipo == "cpf") {
    whereCondicao = {
      [Op.or]: [
        { JPesCNPJ: Documento },
        { FPesCPF: Documento },
      ],
    };
  }
  else {
    whereCondicao = sequelize.literal(`
        Pessoas_ID IN (
            SELECT PesPessoasID 
            FROM PessoasContatos With(NOLOCK) 
            Where ISNULL(PesDDD,'') + ISNULL(PesTelefone,'') = '${Documento}'
        )
    `);
  }


  pessoaDevedor = await Pessoas.findAll({
    where: whereCondicao,
  })
    .then((data) => {
      if (data.length == 0) {
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
      return;
    });




  if (pessoaDevedor.Vazio !== undefined) {
    res.status(200).json({
      message: "Operação bem sucedida mas nenhum devedor encontrado!",
    });
    return;
  }

  await sequelize
    .query(
      "INSERT INTO LogsPortalCobrancas (LoCPF, LoAcao, LoData, LoPessoasID) " +
      "Values('" +
      pessoaDevedor.DevedorDocumento +
      "','BUSCOU DEVEDOR - WHATSAPP " +
      pessoaDevedor.DevedorNome +
      "', GetDate()," +
      pessoaDevedor.Pessoas_ID +
      ")",
      { type: QueryTypes.INSERT }
    )
    .catch((err) => {
      console.log("Erro: " + err.message);
    });

  var docs;
  try {
    docs = await sequelize.query(
      `SELECT Movimentacoes_ID, MoInadimplentesID, MoClientesID, dbo.RetornaNomeRazaoSocial(MoClientesID) Credor_Nome, dbo.RetornaCPFCNPJ(MoClientesID,1) Credor_CNPJ, MoValorDocumento,
      MoDataVencimento, CaOperadorProprietarioID CobradorID, dbo.RetornaNomeUsuario(CaOperadorProprietarioID) Cobrador, UsEmail EmailCobrador
       FROM Movimentacoes With(NOLOCK) 
       Left Join CampanhasPessoas with(NOLOCK) On MoInadimplentesID = CaPessoasID AND MoCampanhasID = CaCampanhasID
       Left Join Usuarios With(NOLOCK) On CaOperadorProprietarioID = Usuarios_ID
       WHERE MoInadimplentesID = :pessoaDevedorID AND MoStatusMovimentacao = 0 
      AND MoOrigemMovimentacao IN ('I', 'C') ORDER BY MoInadimplentesID ASC, MoClientesID ASC, MoDataVencimento ASC`,
      {
        type: QueryTypes.SELECT,
        replacements: { pessoaDevedorID: pessoaDevedor.Pessoas_ID },
      }
    );
  } catch (err) {
    res.status(500).json({
      message: err.message + ' Algum erro aconteceu na busca dos Documentos!',
    });
  }

  let jsonDevedor = JSON.parse(JSON.stringify(pessoaDevedor));
  let jsonDocs = JSON.parse(JSON.stringify(docs));

  const hoje = new Date();
  jsonDocs.forEach((doc) => {
    const dataVencimento = new Date(doc.MoDataVencimento);
    const diferencaEmMilissegundos = dataVencimento - hoje;
    const diferencaEmDias = Math.ceil(diferencaEmMilissegundos / (1000 * 60 * 60 * 24));
    doc.DiasEmAtraso = diferencaEmDias * -1;
  });

  jsonDevedor.Documentos = jsonDocs;


  res.send(jsonDevedor).status(200);
}

exports.atualizaEmail = async (req, res) => {
  const cpf = req.body.cpf ? String(req.body.cpf) : "";
  const email = req.body.email || null;
  let telefone = req.body.telefone ? String(req.body.telefone) : "";
  let contato = req.body.contato;
  let DDD = null;

  if (!cpf) {
    return res
      .status(406)
      .json({ message: "Documento da pessoa nao pode ser vazio!" });
  }

  if (!email && !telefone) {
    return res.status(406).json({ message: "Email e telefone nao informados!" });
  }

  // O telefone é opcional quando um e-mail é informado. Se vier preenchido,
  // aceita de 8 a 11 dígitos e separa o DDD nos números de 10 ou 11 dígitos.
  if (telefone && (telefone.length > 11 || telefone.length < 8)) {
    return res.status(406).json({ message: "Telefone de tamanho invalido!" });
  }

  if (telefone.length === 11 || telefone.length === 10) {
    DDD = telefone.substring(0, 2);
    telefone = telefone.substring(2, 50);
  }

  try {
    // Usa findOne porque a rotina trabalha apenas com a primeira pessoa encontrada.
    const pessoa = await Pessoas.findOne({
      where: {
        [Op.or]: [{ JPesCNPJ: cpf }, { FPesCPF: cpf }],
      },
    });

    if (!pessoa) {
      return res.status(406).send({ message: "Nenhuma Pessoa encontrada!" });
    }

    if (!contato) {
      contato = pessoa.FPesNome || pessoa.JPesRazaoSocial;
    }

    // Parâmetros nomeados evitam quebra do SQL e injeção quando os valores
    // contêm aspas ou outros caracteres especiais.
    await sequelize.query(
      `INSERT INTO PessoasContatos
        (PesPessoasID, PesDDD, PesTelefone, PesEmail, PesOrigemContato, PesContato)
       VALUES
        (:pessoaId, :ddd, :telefone, :email, 'Portal', :contato)`,
      {
        replacements: {
          pessoaId: pessoa.Pessoas_ID,
          ddd: DDD,
          telefone: telefone || null,
          email,
          contato: contato || null,
        },
        type: QueryTypes.INSERT,
      }
    );

    // O log é secundário: se ele falhar, o contato já inserido continua válido.
    // O erro é registrado no PM2, mas não causa uma segunda resposta HTTP.
    try {
      await sequelize.query(
        `INSERT INTO LogsPortalCobrancas
          (LoCPF, LoAcao, LoData, LoPessoasID)
         VALUES
          (:cpf, :acao, GETDATE(), :pessoaId)`,
        {
          replacements: {
            cpf,
            acao: `ATUALIZOU TELEFONE/ EMAIL ${DDD || ""} ${telefone || ""} ${email || ""}`.trim(),
            pessoaId: pessoa.Pessoas_ID,
          },
          type: QueryTypes.INSERT,
        }
      );
    } catch (error) {
      console.error("Erro ao registrar log da atualização de contato:", error.message);
    }

    return res.status(200).send("Contato inserido com sucesso");
  } catch (error) {
    console.error("Erro ao atualizar contato:", error.message);
    return res.status(500).json({
      message: `${error.message} Não foi possível atualizar o contato.`,
    });
  }
};

exports.findOne = async (req, res) => {

  if (!req.params.Documento) {
    res
      .status(406)
      .send({ message: "Documento inválido, por favor preencha novamente!" });
    return;
  }

  //registra log
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
      return;
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
      pessoaDevedor.DevedorDocumento +
      "','BUSCOU COMBOS " +
      pessoaCliente.CredorDocumento +
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

    //var testeJsoon;
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

  var CPFDevedor;

  // Pega CPF Devedor
  await sequelize
    .query(`select dbo.RetornaCPFCNPJ(${InadimplenteID},0) CPF`, {
      type: QueryTypes.SELECT,
    })
    .then((data) => {
      if (data.length === 0) {
        res.status(400).send({ mensagem: "Erro ao pegar o CPF do devedor" });
      } else {
        CPFDevedor = data[0].CPF;
      }
    })
    .catch((err) => {
      CPFDevedor = "";
    });

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

  console.log("esse é meu juros maroto " + politicas.PeJuros);

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

      if (Desconto == null) Desconto = 0;

      if (Desconto > 0) {
        var ValorDesconto = (ValorAtualizadoTotal * Desconto) / 100;
      } else ValorDesconto = 0;

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

  let Desconto = politicas.PeDescontoMaximoPercent;

  if (Desconto == null) Desconto = 0;

  var sql = `SET dateformat dmy INSERT INTO MovimentacoesAcordos (MoUsuariosID, MoParcelas, moValorOriginalSemCalc, moValorDesconto,  
    moPorcentagemDesconto,MoValorTotalJuros,MoTotalHonorarios,MoValorTotalMulta,
    MoValorOriginal, MoClientesID, MoInadimplentesID, MoCampanhasID, MoCodigoCampanha,
    MoValorTotalParcelas, MoDataPrimeiraParcela, MoDataUltimaParcela,
    MoTabelaIndicesEconomicosID, MoPessoasPoliticaCobrancasID, MoSaldoDevedor,
    MoTotalCorrecao, MoOrigemAcordo) VALUES((SELECT TOP 1 Usuarios_ID FROM USUARIOS Where USNome='CALLTECH'),
    ${politicas.PeQuantidadeMaxParcelas},'${OriginalSemCalc.toFixed(
    2
  )}','${DescontoReal.toFixed(2)}','${Desconto}','${TotalJuros.toFixed(
    2
  )}','${TotalHonorarios.toFixed(2)}','${TotalMulta.toFixed(2)}','${parseFloat(
    ValorFinal
  ).toFixed(
    2
  )}',${ClienteID},${InadimplenteID},${CampanhaID},'${CampanhaCodigo}','${parseFloat(
    ValorFinal
  ).toFixed(2)}','${req.body.primeiro_venc}','${req.body.ultimo_venc}',${politicas.PeTabelaIndicesEconomicosID == 0
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

  //insert politicas
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
      (politicas.PeJuros == null ? 0 : politicas.PeJuros) +
      "','" +
      docsAtualizados[index].JurosReal +
      "','" +
      (politicas.PeMulta == null ? 0 : politicas.PeMulta) +
      "','" +
      docsAtualizados[index].MultaReal +
      "','" +
      (politicas.PeHonorario == null ? 0 : politicas.PeHonorario) +
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
      res.status(400).send({ erro: err.message, query: sql });
      return;
    });

    if (Erro) return;
  }

  await sequelize
    .query(
      "INSERT INTO LogsPortalCobrancas (LoCPF, LoAcao, LoData, LoPessoasID) " +
      "Values('" +
      CPFDevedor +
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

  //Gera contato ficha

  if (CampanhaCodigo !== "NULL") {
    var ResumoID;
    var FoneListID;

    ResumoID = "";
    FoneListID = "";

    //Pega R.O
    await sequelize
      .query(
        `SELECT ResumoDeOperacoes_ID ID FROM ResumoDeOperacoes WHERE ReNomeInterno = 'ACORDO_PORTAL'`,
        {
          type: QueryTypes.SELECT,
        }
      )
      .then((data) => {
        if (data.length === 0) {
          //res.status(400).send({ mensagem: "Nenhum registro encontrado" });
        } else {
          ResumoID = data[0].ID;
        }
      })
      .catch((err) => {
        Console.log(
          err.mensagem + " Erro ao R.O fonelist para gerar Contato ficha "
        );
      });

    //Pega FoneList
    await sequelize
      .query(
        `Select FN_FoneList_` +
        CampanhaCodigo +
        `_ID ID from Fone_List_` +
        CampanhaCodigo +
        ` Where FN_PessoasID =` +
        InadimplenteID,
        {
          type: QueryTypes.SELECT,
        }
      )
      .then((data) => {
        if (data.length === 0) {
          //res.status(400).send({ mensagem: "Nenhum registro encontrado" });
        } else {
          FoneListID = data[0].ID;
        }
      })
      .catch((err) => {
        Console.log(
          err.mensagem + " Erro ao localizar fonelist para gerar Contato ficha "
        );
      });

    if (ResumoID !== "" && ResumoID !== "undefined" && FoneListID !== "") {
      console.log(ResumoID + " " + FoneListID + " Inseriu contato ficha");

      await sequelize
        .query(
          "INSERT INTO ContatosFichas_" +
          CampanhaCodigo +
          " (CoFoneListsID, CoDataInicioFicha, CoDataTerminoFicha, " +
          "CoUsuariosID, CoResumoOperacaoID, CoHistoricoFicha, CoCriterioOrigem)" +
          " VALUES(" +
          FoneListID +
          ", GetDate(), GetDate(),(SELECT Usuarios_ID From Usuarios With(NOLOCK) Where UsNome = 'CALLTECH' )," +
          ResumoID +
          ", 'Realizou acordo de Nº " +
          AcordoID +
          " via Portal de negociação.','API - Portal Neg.')",
          { type: QueryTypes.INSERT }
        )
        .catch((err) => {
          res.status(400).send({ erro: err.message });
          return;
        });

      await sequelize
        .query(
          "Update Fone_List_" +
          CampanhaCodigo +
          " SET FN_UltimoROID=" +
          ResumoID +
          " , FN_DataUltimoContato = GetDate() Where FN_PessoasID =" +
          InadimplenteID,
          { type: QueryTypes.INSERT }
        )
        .catch((err) => {
          res.status(400).send({ erro: err.message });
          return;
        });
    }
  }

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
/**
 * Registra um lote de resumos de operação (R.O.).
 *
 * Fluxo geral:
 * 1. Agrupa os registros por campanha, pois cada campanha possui suas próprias
 *    tabelas Fone_List_XXXXXX e ContatosFichas_XXXXXX.
 * 2. Valida operador, resumo, motivo e vínculo da pessoa com a campanha.
 * 3. Insere os contatos válidos e atualiza o último R.O. da FoneList.
 * 4. Para as campanhas 33 e 74, informa também a ocorrência no serviço da Tenda.
 *
 * Uma falha de validação afeta somente o registro inválido. Uma falha na Tenda
 * não desfaz o contato já salvo: ela é informada em sucesso.integracaoTenda.
 */
exports.registrarResumo = async (req, res) => {
  try {
    // Formato esperado: { registros: [{ campanhaId, pessoaId, resumoId, ... }] }.
    const { registros } = req.body;

    if (!Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({ mensagem: 'Array de registros não informado ou vazio.' });
    }

    // Mantém a posição original de cada item para o cliente relacionar a resposta
    // com o registro que enviou, mesmo após o agrupamento por campanha.
    const resultados = {
      sucessos: [],
      erros: []
    };

    // O processamento precisa ser separado por campanha porque o nome das tabelas
    // físicas muda de acordo com o código da campanha.
    const registrosPorCampanha = {};

    for (let i = 0; i < registros.length; i++) {
      const registro = registros[i];
      const chave = registro.campanhaId || registro.codigoCampanha;

      if (!chave) {
        resultados.erros.push({
          indice: i,
          registro,
          erro: 'Campanha não informada.'
        });
        continue;
      }

      if (!registrosPorCampanha[chave]) {
        registrosPorCampanha[chave] = [];
      }

      registrosPorCampanha[chave].push({ ...registro, indice: i });
    }

    // Antes de iniciar o loop das campanhas, verifica se o lote possui algum
    // registro das campanhas Tenda. Nesse caso, carrega credor, usuário, empresa
    // e senha do webservice uma única vez e reutiliza a configuração no lote todo.
    const possuiCampanhaTenda = Object.values(registrosPorCampanha).some(
      registrosCampanha => [33, 74].includes(Number(registrosCampanha[0].campanhaId))
    );

    let configuracaoTenda;
    let erroConfiguracaoTenda;

    if (possuiCampanhaTenda) {
      try {
        configuracaoTenda = await tendaService.buscarConfiguracao(db.sequelize);
      } catch (error) {
        erroConfiguracaoTenda =
          error.message || error.code || String(error) ||
          "Não foi possível carregar a configuração da Tenda.";
      }
    }

    // Processa cada campanha separadamente, mas produz uma única resposta ao final.
    for (const chaveCampanha in registrosPorCampanha) {
      const registrosCampanha = registrosPorCampanha[chaveCampanha];
      const primeiroRegistro = registrosCampanha[0];

      let campanhaIdFinal = primeiroRegistro.campanhaId;
      let codigoCampanhaFinal = primeiroRegistro.codigoCampanha;

      // O cliente pode enviar campanhaId, codigoCampanha ou ambos. O código é
      // necessário para montar os nomes das tabelas específicas da campanha.
      if (campanhaIdFinal && !codigoCampanhaFinal) {
        const [result] = await db.sequelize.query(
          `SELECT CaCodigo FROM Campanhas WHERE Campanhas_ID = :campanhaId`,
          {
            replacements: { campanhaId: campanhaIdFinal },
            type: db.Sequelize.QueryTypes.SELECT
          }
        );

        if (!result) {
          registrosCampanha.forEach(reg => {
            resultados.erros.push({
              indice: reg.indice,
              registro: reg,
              erro: 'Campanha não encontrada.'
            });
          });
          continue;
        }

        codigoCampanhaFinal = result.CaCodigo;
      }

      codigoCampanhaFinal = String(codigoCampanhaFinal);

      // Exemplo: código 33 gera Fone_List_000033 e ContatosFichas_000033.
      const codigoCampanhaFormatado = codigoCampanhaFinal.padStart(6, '0');
      const tabelaFoneList = `Fone_List_${codigoCampanhaFormatado}`;
      const tabelaContatosFichas = `ContatosFichas_${codigoCampanhaFormatado}`;
      // Regra trazida do legado: somente os IDs 33 e 74 informam ocorrência
      // à Tenda. Não é consultada a antiga flag Param_UtilizaIntegracaoTenda.
      const integraTenda = [33, 74].includes(Number(campanhaIdFinal));

      // Remove IDs repetidos para consultar cada tabela de validação uma única vez.
      const operadoresIds = [...new Set(registrosCampanha.map(r => r.operadorId).filter(Boolean))];
      const resumosIds = [...new Set(registrosCampanha.map(r => r.resumoId).filter(Boolean))];
      const motivosIds = [...new Set(registrosCampanha.map(r => r.motivoId).filter(Boolean))];
      const pessoasIds = [...new Set(
        registrosCampanha
          .filter(r => r.pessoaId && !r.fonelistId)
          .map(r => r.pessoaId)
      )];

      // Marca o registro como inválido quando o operador não existe. O registro
      // marcado será removido antes do INSERT, sem impedir os demais do lote.
      if (operadoresIds.length > 0) {
        const operadoresValidos = await db.sequelize.query(
          `SELECT Usuarios_ID FROM Usuarios WHERE Usuarios_ID IN (:ids)`,
          {
            replacements: { ids: operadoresIds },
            type: db.Sequelize.QueryTypes.SELECT
          }
        );
        const idsValidos = new Set(operadoresValidos.map(o => o.Usuarios_ID));

        registrosCampanha.forEach(reg => {
          if (reg.operadorId && !idsValidos.has(reg.operadorId)) {
            reg._erroValidacao = 'Usuário não existe.';
          }
        });
      }

      // Confirma se cada R.O. recebido existe em ResumoDeOperacoes.
      if (resumosIds.length > 0) {
        const resumosValidos = await db.sequelize.query(
          `SELECT ResumoDeOperacoes_ID FROM ResumoDeOperacoes WHERE ResumoDeOperacoes_ID IN (:ids)`,
          {
            replacements: { ids: resumosIds },
            type: db.Sequelize.QueryTypes.SELECT
          }
        );
        const idsValidos = new Set(resumosValidos.map(r => r.ResumoDeOperacoes_ID));

        registrosCampanha.forEach(reg => {
          if (reg.resumoId && !idsValidos.has(reg.resumoId)) {
            reg._erroValidacao = 'Resumo de Operação não existe.';
          }
        });
      }

      // O motivo é opcional, mas, quando informado, precisa existir.
      if (motivosIds.length > 0) {
        const motivosValidos = await db.sequelize.query(
          `SELECT Motivos_ID FROM Motivos WHERE Motivos_ID IN (:ids)`,
          {
            replacements: { ids: motivosIds },
            type: db.Sequelize.QueryTypes.SELECT
          }
        );
        const idsValidos = new Set(motivosValidos.map(m => m.Motivos_ID));

        registrosCampanha.forEach(reg => {
          if (reg.motivoId && !idsValidos.has(reg.motivoId)) {
            reg._erroValidacao = 'Motivo não existe.';
          }
        });
      }

      // ContatosFichas grava CoFoneListsID. Quando o cliente envia somente
      // pessoaId, localiza o ID correspondente na FoneList desta campanha.
      if (pessoasIds.length > 0) {
        const fonelistsPorPessoa = await db.sequelize.query(
          `SELECT FN_PessoasID, FN_FoneList_${codigoCampanhaFormatado}_ID AS id
           FROM ${tabelaFoneList}
           WHERE FN_PessoasID IN (:ids)`,
          {
            replacements: { ids: pessoasIds },
            type: db.Sequelize.QueryTypes.SELECT
          }
        );

        const mapaPessoas = new Map(
          fonelistsPorPessoa.map(f => [f.FN_PessoasID, f.id])
        );

        registrosCampanha.forEach(reg => {
          if (reg.pessoaId && !reg.fonelistId) {
            const fonelistId = mapaPessoas.get(reg.pessoaId);
            if (fonelistId) {
              reg.fonelistId = fonelistId;
            } else {
              reg._erroValidacao = 'Pessoa não localizada na campanha.';
            }
          }
        });
      }

      // A Tenda identifica o cliente pelo REGIS, que no MaxOne corresponde a
      // Pessoas.PesCodigoIntegracao. Se recebemos somente fonelistId, o caminho é:
      // fonelistId -> FN_PessoasID -> PesCodigoIntegracao.
      if (integraTenda) {
        const fonelistIdsSemPessoa = [...new Set(
          registrosCampanha
            .filter(reg => !reg.pessoaId && reg.fonelistId)
            .map(reg => reg.fonelistId)
        )];

        // Mapa usado para relacionar rapidamente cada FoneList à sua pessoa.
        const pessoasPorFonelist = new Map();

        if (fonelistIdsSemPessoa.length > 0) {
          const fonelists = await db.sequelize.query(
            `SELECT FN_FoneList_${codigoCampanhaFormatado}_ID AS id, FN_PessoasID
             FROM ${tabelaFoneList}
             WHERE FN_FoneList_${codigoCampanhaFormatado}_ID IN (:ids)`,
            {
              replacements: { ids: fonelistIdsSemPessoa },
              type: db.Sequelize.QueryTypes.SELECT
            }
          );

          fonelists.forEach(fonelist => {
            pessoasPorFonelist.set(String(fonelist.id), fonelist.FN_PessoasID);
          });
        }

        registrosCampanha.forEach(reg => {
          reg._pessoaIdTenda = reg.pessoaId || pessoasPorFonelist.get(String(reg.fonelistId));
        });

        const pessoasIdsTenda = [...new Set(
          registrosCampanha.map(reg => reg._pessoaIdTenda).filter(Boolean)
        )];

        if (pessoasIdsTenda.length > 0) {
          const pessoasTenda = await db.sequelize.query(
            `SELECT Pessoas_ID, PesCodigoIntegracao
             FROM Pessoas WITH (NOLOCK)
             WHERE Pessoas_ID IN (:ids)`,
            {
              replacements: { ids: pessoasIdsTenda },
              type: db.Sequelize.QueryTypes.SELECT
            }
          );

          // Guarda o REGIS por pessoa para anexá-lo ao registro que será inserido.
          const codigosPorPessoa = new Map(
            pessoasTenda.map(pessoa => [
              String(pessoa.Pessoas_ID),
              pessoa.PesCodigoIntegracao
            ])
          );

          registrosCampanha.forEach(reg => {
            reg._codigoIntegracaoTenda = codigosPorPessoa.get(String(reg._pessoaIdTenda));
          });
        }
      }

      // Transfere para resultados.erros tudo o que falhou nas validações e mantém
      // em registrosValidos somente os itens que podem ser gravados.
      const registrosValidos = registrosCampanha.filter(reg => {
        if (reg._erroValidacao) {
          resultados.erros.push({
            indice: reg.indice,
            registro: reg,
            erro: reg._erroValidacao
          });
          return false;
        }

        if (!reg.pessoaId && !reg.fonelistId) {
          resultados.erros.push({
            indice: reg.indice,
            registro: reg,
            erro: 'Pessoa não informada.'
          });
          return false;
        }

        // Converte as datas ISO recebidas pela API para Date antes de enviá-las
        // ao Sequelize/SQL Server. Enviar diretamente uma string com fuso, como
        // "2026-09-23T10:40:00-03:00", pode causar erro de conversão no SQL Server.
        const agora = new Date();
        reg._dataHoraNormalizada = reg.dataHora ? new Date(reg.dataHora) : agora;
        reg._dataInicioNormalizada = reg.dataInicio ? new Date(reg.dataInicio) : agora;
        reg._dataFimNormalizada = reg.dataFim ? new Date(reg.dataFim) : agora;

        const possuiDataInvalida = [
          reg._dataHoraNormalizada,
          reg._dataInicioNormalizada,
          reg._dataFimNormalizada
        ].some(data => Number.isNaN(data.getTime()));

        if (possuiDataInvalida) {
          resultados.erros.push({
            indice: reg.indice,
            registro: reg,
            erro: 'Data inválida. Verifique dataHora, dataInicio e dataFim.'
          });
          return false;
        }

        return true;
      });

      if (registrosValidos.length === 0) continue;

      // Prepara os valores do INSERT. Campos iniciados por "_" são metadados de
      // controle usados depois e não são enviados como colunas ao SQL Server.
      const valoresInsert = registrosValidos.map(reg => {
        // Mesmo após validar como Date, removemos o offset antes do SQL. Colunas
        // datetime não aceitam textos como "2026-09-23T10:39:00-03:00".
        const dataHoraFinal = formatarDataSqlServer(reg._dataHoraNormalizada);
        const criterioOrigem = reg.origem || 'API - MaxSmart';
        const dataInicioFinal = formatarDataSqlServer(reg._dataInicioNormalizada);
        const dataFimFinal = formatarDataSqlServer(reg._dataFimNormalizada);
        // A duração é armazenada em minutos, como no comportamento anterior.
        const duracaoFicha = Math.abs(
          reg._dataFimNormalizada - reg._dataInicioNormalizada
        ) / 60000;

        return {
          CoFoneListsID: reg.fonelistId,
          CoDataInicioFicha: dataInicioFinal,
          CoDataFimFicha: dataFimFinal,
          CoDuracaoFicha: duracaoFicha,
          CoUsuariosID: reg.operadorId,
          CoResumoOperacaoID: reg.resumoId,
          CoProtocolo: reg.protocolo || null,
          CoConseguiuContato: reg.conseguiuContato || false,
          CoMotivoRoID: reg.motivoId || null,
          CoCriterioOrigem: criterioOrigem,
          CoMaquina: funcoes.getComputerName(),
          CoVersaoSistema: '5.0',
          CoHistoricoFicha: reg.historico,
          _dataHoraFinal: dataHoraFinal,
          _indice: reg.indice,
          _resumoId: reg.resumoId,
          _motivoId: reg.motivoId,
          _historico: reg.historico,
          _codigoIntegracaoTenda: reg._codigoIntegracaoTenda
        };
      });

      // Cria um único INSERT com várias linhas para reduzir viagens ao banco.
      // Os sufixos numéricos (:CoFoneListsID0, :CoFoneListsID1...) evitam colisão
      // entre os parâmetros dos diferentes registros.
      const placeholders = valoresInsert.map((_, i) =>
        `(:CoFoneListsID${i}, :CoDataInicioFicha${i}, :CoDataFimFicha${i}, :CoDuracaoFicha${i},
         :CoUsuariosID${i}, :CoResumoOperacaoID${i}, :CoProtocolo${i}, :CoConseguiuContato${i},
         :CoMotivoRoID${i}, :CoCriterioOrigem${i}, :CoMaquina${i}, :CoVersaoSistema${i}, :CoHistoricoFicha${i})`
      ).join(',\n');

      const replacements = {};
      valoresInsert.forEach((val, i) => {
        Object.keys(val).forEach(key => {
          // Metadados internos não correspondem a colunas da tabela.
          if (!key.startsWith('_')) {
            replacements[`${key}${i}`] = val[key];
          }
        });
      });

      // OUTPUT devolve o ID criado para cada contato; ele será retornado ao cliente
      // e também usado para marcar CoInformouRecupera após sucesso na Tenda.
      const [resultadosInsert] = await db.sequelize.query(
        `INSERT INTO ${tabelaContatosFichas} 
          (CoFoneListsID, CoDataInicioFicha, CoDataTerminoFicha, CoDuracaoFicha,
           CoUsuariosID, CoResumoOperacaoID, CoProtocolo, CoConseguiuContato,
           CoMotivoRoID, CoCriterioOrigem, CoMaquina, CoVersaoSistema, CoHistoricoFicha)
         OUTPUT INSERTED.${tabelaContatosFichas}_ID
         VALUES ${placeholders}`,
        {
          replacements,
          type: db.Sequelize.QueryTypes.INSERT
        }
      );

      // Atualiza a situação corrente da pessoa na campanha. As atualizações são
      // independentes e executadas em paralelo após o INSERT dos contatos.
      const updatesPromises = valoresInsert.map((val, i) => {
        return db.sequelize.query(
          `UPDATE ${tabelaFoneList}
           SET FN_UltimoROID = :resumoId,
               FN_DataUltimoContato = :dataHora
           WHERE FN_FoneList_${codigoCampanhaFormatado}_ID = :fonelistId`,
          {
            replacements: {
              resumoId: val._resumoId,
              dataHora: val._dataHoraFinal,
              fonelistId: val.CoFoneListsID
            },
            type: db.Sequelize.QueryTypes.UPDATE
          }
        );
      });

      await Promise.all(updatesPromises);

      // Preserva a relação posicional entre valoresInsert e resultadosInsert.
      const sucessosCampanha = [];
      resultadosInsert.forEach((result, i) => {
        const sucesso = {
          indice: valoresInsert[i]._indice,
          contatoFichaId: result[`${tabelaContatosFichas}_ID`]
        };

        sucessosCampanha.push(sucesso);
        resultados.sucessos.push(sucesso);
      });

      // A integração acontece somente depois de o contato estar salvo no MaxOne.
      // Assim, indisponibilidade da Tenda não provoca perda do atendimento local.
      if (integraTenda) {
        // Se a leitura feita antes do loop falhou, todos os contatos Tenda recebem
        // o mesmo diagnóstico sem repetir a consulta de configuração.
        if (erroConfiguracaoTenda) {
          sucessosCampanha.forEach(sucesso => {
            sucesso.integracaoTenda = {
              informada: false,
              erro: erroConfiguracaoTenda
            };
          });
        }

        if (configuracaoTenda) {
          // Registros com o mesmo R.O./motivo compartilham o mesmo mapeamento.
          // O cache evita repetir a consulta em TendaMapeamentoROs.
          const cacheMapeamentos = new Map();

          for (let i = 0; i < valoresInsert.length; i++) {
            const valor = valoresInsert[i];
            const sucesso = sucessosCampanha[i];

            try {
              // Sem PesCodigoIntegracao não existe REGIS para identificar o cliente
              // no serviço externo. O contato local permanece gravado.
              if (!valor._codigoIntegracaoTenda) {
                throw new Error("Pessoa sem código de integração (REGIS) para a Tenda.");
              }

              const chaveMapeamento = `${valor._resumoId}:${Number(valor._motivoId) || 0}`;

              if (!cacheMapeamentos.has(chaveMapeamento)) {
                cacheMapeamentos.set(
                  chaveMapeamento,
                  await tendaService.mapearOcorrencia(
                    db.sequelize,
                    valor._resumoId,
                    valor._motivoId
                  )
                );
              }

              const mapeamento = cacheMapeamentos.get(chaveMapeamento);

              // O código externo é obrigatório. O mapeamento pode ser específico
              // para o motivo ou o mapeamento padrão do R.O. (motivo nulo).
              if (!mapeamento.codigo) {
                throw new Error("Mapeamento de ocorrência da Tenda não encontrado.");
              }

              // Reproduz o legado: "motivo Tenda - quebra de linha + histórico".
              const complemento =
                `${mapeamento.motivo ? `${mapeamento.motivo} - \r\n` : ""}` +
                `${valor._historico || ""}`;

              const retornoTenda = await tendaService.incluirOcorrencia({
                configuracao: configuracaoTenda,
                codigo: mapeamento.codigo,
                regis: valor._codigoIntegracaoTenda,
                complemento,
                dataAgenda: new Date()
              });

              // Código 00 é a confirmação de sucesso definida pelo webservice.
              sucesso.integracaoTenda = {
                informada: retornoTenda.codigo === "00",
                codigo: retornoTenda.codigo || null,
                mensagem: retornoTenda.mensagem || null
              };

              // Só marca CoInformouRecupera quando a ocorrência foi efetivamente
              // aceita. Isso permite identificar contatos pendentes de reenvio.
              if (retornoTenda.codigo === "00") {
                try {
                  await db.sequelize.query(
                    `UPDATE ${tabelaContatosFichas}
                     SET CoInformouRecupera = 1
                     WHERE ${tabelaContatosFichas}_ID = :contatoFichaId`,
                    {
                      replacements: { contatoFichaId: sucesso.contatoFichaId },
                      type: db.Sequelize.QueryTypes.UPDATE
                    }
                  );

                  sucesso.integracaoTenda.registroAtualizado = true;
                } catch (error) {
                  sucesso.integracaoTenda.registroAtualizado = false;
                  sucesso.integracaoTenda.erroAtualizacao = error.message;
                  console.error(
                    "Ocorrência informada à Tenda, mas não foi possível atualizar CoInformouRecupera:",
                    error.message
                  );
                }
              }
            } catch (error) {
              // Não lança o erro para o catch geral: o registro no MaxOne já foi
              // concluído e a falha externa deve aparecer apenas neste item.
              sucesso.integracaoTenda = {
                informada: false,
                erro: error.message
              };
              console.error("Erro ao informar ocorrência à Tenda:", error.message);
            }
          }
        }
      }
    }

    // Retorna contagens gerais e detalhes item a item, incluindo a integração Tenda.
    return res.status(201).json({
      mensagem: 'Processamento em lote concluído.',
      total: registros.length,
      sucessos: resultados.sucessos.length,
      erros: resultados.erros.length,
      detalhes: resultados
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensagem: 'Erro ao registrar resumos em lote.',
      erro: error.message
    });
  }
};


exports.baixarArquivosTenda = async (req, res) => {
  const sftp = new Client();

  try {
    // 🔹 1) Conectar no SFTP
    await sftp.connect({
      host: process.env.SFTP_HOST,
      port: process.env.SFTP_PORT || 22,
      username: process.env.SFTP_USER,
      password: process.env.SFTP_PASS,
    });

    console.log("✅ Conectado ao SFTP");

    const remoteDir = process.env.SFTP_DIR || "/";
    const arquivos = await sftp.list(remoteDir);

    // 🔹 2) Garantir pasta temp local
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const processados = [];

    for (const file of arquivos) {
      if (!file.name.endsWith(".txt")) continue;

      const localPath = path.join(tempDir, file.name);
      const remotePath = `${remoteDir}/${file.name}`;
      const remoteNovo = `${remoteDir}/Processado_${file.name}`;

      // 🔹 3) Baixar do SFTP
      await sftp.get(remotePath, localPath);
      console.log(`⬇️  Baixado do SFTP: ${file.name}`);

      // 🔹 4) Subir para FTP comum
      const client = new ftp.Client();
      await client.access({
        host: process.env.FTP_HOST,
        port: process.env.FTP_PORT || 21,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASS,
        secure: false,
      });

      await client.uploadFrom(localPath, file.name);
      console.log(`⬆️  Enviado para FTP: ${file.name}`);
      await client.close();

      // 🔹 5) Renomear no SFTP
      await sftp.rename(remotePath, remoteNovo);
      console.log(`✏️  Renomeado no SFTP para: Processado_${file.name}`);

      processados.push(file.name);
    }

    await sftp.end();

    return res.json({
      sucesso: true,
      mensagem: "Arquivos transferidos e renomeados",
      arquivos: processados,
    });
  } catch (err) {
    console.error("❌ Erro ao transferir arquivos:", err);
    return res.status(500).json({
      sucesso: false,
      erro: err.message,
    });
  }
};

exports.inserirPeso = async (req, res) => {

  const pesagemID = req.body.pesagemID;
  const op = req.body.op;
  const valor = req.body.valor;

  if (!op) {
    res.status(400).send("Campo op obrigatório!");
    return;
  }

  Firebird.attach(fbOptions, function (err, db) {
    if (err) {
      console.error('Erro ao conectar Firebird:', err);
      res.status(500).send("Erro ao conectar Firebird: " + err.message);
      return;
    }

    // Verifica se já existe
    db.query(
      'SELECT * FROM Pesagem_Remota WHERE PESAGEMID = ?',
      [pesagemID],
      function (err, result) {
        if (err) {
          console.error('Erro ao consultar:', err);
          db.detach();
          res.status(500).send("Erro ao consultar: " + err.message);
          return;
        }

        if (result && result.length > 0) {
          db.detach();
          res.status(409).send("PesagemID " + pesagemID + " já existe na base!");
          return;
        }

        // Insere
        db.query(
          'INSERT INTO Pesagem_Remota (ORDEM_PRODUCAO) VALUES (?)',
          [op],
          function (err) {
            db.detach();

            if (err) {
              console.error('Erro ao inserir peso:', err);
              res.status(500).send("Erro ao inserir peso: " + err.message);
              return;
            }

            console.log('Peso inserido -   OP: ' + op);
            res.status(201).send("Peso inserido com sucesso!" + " OP: " + op);
          }
        );
      }
    );
  });

};

exports.listarPesagens = async (req, res) => {

  const dataInicio = req.params.dataInicio || '';
  const dataFim = req.params.dataFim || '';
  const pendentes = req.params.pendentes;
  const ordemProducao = req.params.ordemProducao || '';

  const temData = dataInicio !== '' && dataFim !== '';
  const temOP = ordemProducao !== '';

  if (!temData && !temOP) {
    res.status(400).send("Informe ao menos a data (dataInicio e dataFim) ou a ordem de produção!");
    return;
  }

  let sql = 'SELECT * FROM HISTORICOPESAGENS WHERE 1=1';
  let params = [];

  if (temData) {
    sql += ' AND DATA >= ? AND DATA <= ?';
    params.push(dataInicio, dataFim);
  }

  if (temOP) {
    sql += ' AND ORDEM_PRODUCAO = ?';
    params.push(ordemProducao);
  }

  if (pendentes === '1') {
    sql += ' AND (PESAGEM_IMPRESSA IS NULL OR PESAGEM_IMPRESSA = 0)';
  }

  sql += ' ORDER BY DATA, HORA';

  Firebird.attach(fbOptions, function (err, db) {
    if (err) {
      console.error('Erro ao conectar Firebird:', err);
      res.status(500).send("Erro ao conectar Firebird: " + err.message);
      return;
    }

    db.query(sql, params, function (err, result) {
      db.detach();

      if (err) {
        console.error('Erro ao consultar pesagens:', err);
        res.status(500).send("Erro ao consultar: " + err.message);
        return;
      }

      if (!result || result.length === 0) {
        res.status(404).json({ success: false, message: "Nenhuma pesagem encontrada." });
        return;
      }

      console.log('Pesagens encontradas: ' + result.length);
      res.status(200).json({ success: true, total: result.length, pesagens: result });
    });
  });

};
