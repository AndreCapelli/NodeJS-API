const db = require("../models/index");
const sequelize = db.sequelize;
const { QueryTypes } = require("sequelize");
const funcoes = require("../../funcoes_utils/funcoes/funcoes");
const fs = require("fs");

exports.GravaTxt = async (req, res) => {
  console.log("Ok!");
  res.send("ok!").status(200);
};

exports.retcampanhas = (req, res) => {
  sequelize
    .query("SELECT * FROM CAMPANHAS  ", {
      type: QueryTypes.SELECT,
    })
    .then((data) => {
      if (data.length === 0) {
        res.status(200).send({ mensagem: "Nenhum registro encontrado" });
      } else {
        //res.status(200).json(data); //Retornando json completo
        //res.status(200).json(data[0]); //retornando o primeiro registro do array json
        //res.status(200).json(data[0].Campanhas_ID); //retornando apenas o valor (sem json)

        //retorna o json manipulado, escolhendo somente os campos de interesse
        const retorno = data.map((temp) => {
          return { Campanhas_ID: temp.Campanhas_ID, Codigo: temp.CaCodigo };
        });

        res.status(200).json(retorno);
      }
    })
    .catch((err) => {
      res.status(400).send({ erro: err.message });
    });
};

exports.newPerson = async (req, res) => {
  let validaemail;
  let validaTel;
  let idConta;
  let idPessoa;

  async function aValidaUsuarioRD() {
    await sequelize
      .query("SELECT TOP 1 * From UsuariosRDStations", {
        type: QueryTypes.SELECT,
      })
      .then((data) => {
        if (data.length === 0) {
          res.status(206);
        } else {
          validaemail = data[0].UsValidarEmail;
          idConta = data[0].UsuariosRDStations_ID;
          //exemplo retorno json
          //após dar um res. (responder algo) a rotina não continua, ou seja, não faz nada após responder o metodo
          //res.status(200).send({ idConta, validaemail });
        }
      })
      .catch((err) => {
        res.status(400).send({ erro: err.message });
      });
    return;
  }

  await aValidaUsuarioRD();

  await sequelize
    .query(
      "SELECT ISNULL(CoValidarTelefoneImportacao,0) coValida FROM ConfiguracoesSistemas ",
      {
        type: QueryTypes.SELECT,
      }
    )
    .then((data) => {
      if (data.length === 0) {
        validaTel = false;
      } else {
        validaTel = data[0].coValida;
      }
    })
    .catch((err) => {
      res.status(400).send({ erro: err.message });
    });

  console.log("Chegou ln 79");

  let leTelefone1, leTelefone2;

  leTelefone1 = await funcoes.fnc_RetiraNumerosString(
    req.body.leads[0].personal_phone
  );
  leTelefone2 = await funcoes.fnc_RetiraNumerosString(
    req.body.leads[0].mobile_phone
  );

  console.log(leTelefone1);

  if (
    leTelefone1.length == 12 ||
    (leTelefone1.length == 13 && leTelefone1.substring(0, 2) == "55")
  )
    leTelefone1 = leTelefone1.substring(4, 20);

  if (
    leTelefone2.length == 12 ||
    (leTelefone2.length == 13 && leTelefone2.substring(0, 2) == "55")
  )
    leTelefone2 = leTelefone2.substring(4, 20);

  console.log(leTelefone1);
  console.log(leTelefone2);

  let leOrigem1, leOrigem2;
  leOrigem1 = req.body.leads[0].first_conversion.conversion_origin.source;
  leOrigem2 = req.body.leads[0].last_conversion.conversion_origin.source;

  // && - and do if
  // || - or do if
  // != - diferente <>
  await sequelize
    .query(
      // exemplo de IIF js..
      validaemail && req.body.leads[0].email != ""
        ? `Select distinct Pessoas_ID From Pessoas With(NOLOCK) 
   Inner Join PessoasContatos ON Pessoas_ID = PesPessoasID  Where ISNULL(PesEmail,'') ='${req.body.leads[0].email}'`
        : `Select distinct Pessoas_ID From Pessoas With(NOLOCK) Where ISNULL(PesRDStationID,'') =
   '${req.body.leads[0].id}'`,
      {
        type: QueryTypes.SELECT,
      }
    )
    .then((data) => {
      if (data.length === 0) {
        idPessoa = "";
        //res.status(200).send({ mensamge: "sem conteudo" });
      } else {
        idPessoa = data[0].Pessoas_ID;
        //res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(400).send({ erro: err.message });
    });

  console.log(idPessoa);
  if (idPessoa == "") {
    console.log("Pessoa não encontrada, inserindo");

    await sequelize
      .query(
        "INSERT INTO LayoutImportacoesLogs(LaUsuariosID, LaDataImportacao, LaLoteImportacao, LaResultado, LaMotivo) " +
          "VALUES(13, GETDATE(), -15, 'RD: Robmar ', 'Pessoa não encontrada, será cadastrada') ",
        { type: QueryTypes.INSERT }
      )
      .catch((err) => {
        res.status(400).send({ erro: err.message });
      });
  } else {
    console.log("Pessoa encontrada, atualizando");
  } // fim do if cadastra ou atualiza pessoa
}; // fim newPerson
