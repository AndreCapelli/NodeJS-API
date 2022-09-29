const db = require("../models/index");
const sequelize = db.sequelize;
const { QueryTypes } = require("sequelize");

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

exports.newPerson = (req, res) => {
  let validaemail;
  let idConta;
  let idPessoa;

  async function ValidaUsuarioRD() {
    const rd = await sequelize
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
    return rd;
  }

  async function aValidaUsuarioRD() {
    await ValidaUsuarioRD();
  }

  aValidaUsuarioRD();
  console.log("Chegou");

  // && - and do if
  // || - or do if
  // != - diferente <>
  if (validaemail && req.body.leads[0].email != "") {
    sequelize
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
          res.status(200).send({ mensamge: "sem conteudo" });
        } else {
          idPessoa = data[0].Pessoas_ID;
          res.status(200).json(data);
        }
      })
      .catch((err) => {
        res.status(400).send({ erro: err.message });
      });
  } else {
    idPessoa = validaemail ? "" : 0;
  }
};
