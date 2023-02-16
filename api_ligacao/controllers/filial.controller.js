const db = require("../models/index");
const Sequelize = require("sequelize");
const sequelize = db.sequelize;
const { QueryTypes, json } = require("sequelize");
const nodemailer = require("nodemailer");

exports.apiLife = (req, res) => {
  console.log("api ligações da call está viva!");
  res.status(200).json({ mensagem: "api ligações da call está viva!" });
};

exports.retornaCredenciais = async (req, res) => {
  console.log(req.body);
  sequelize
    .query(
      `select dbo.RetornaNomeRazaoSocial(PePessoasID) Empresa, case PeCloudServidor
        when '10.100.19.127' then 'node68404-cliente.jelastic.saveincloud.net,11051'
        when '200.150.198.251' then '200.150.198.251'
        when '200.150.199.91' then '200.150.199.91'
        else PeCloudServidor end as Servidor, PeCloudBase as Base, PeCloudUsuario as Usuario, PePassWordBase as Senha  
        from pessoasContratos with(nolock)
        inner join PessoasFiliais with(nolock) on PePessoasFiliaisID = PessoasFiliais_ID
        where PePessoasFiliaisID =${req.body.filial}`,
      {
        type: QueryTypes.SELECT,
      }
    )
    .then((data) => {
      if (data.length === 0) {
        res.status(400).json({ mensagem: "filial não encontrada!" });
      } else {
        res.json(data[0]).status(201);
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.json(err.message).status(400);
    });
};

exports.retornaUsuario = async (req, res) => {
  console.log(req.body.Servidor);

  const connFilial = new Sequelize(
    req.body.Base,
    req.body.Usuario,
    req.body.Senha,
    {
      host:
        req.body.Servidor == "node68404-cliente.jelastic.saveincloud.net,11051"
          ? "node68404-cliente.jelastic.saveincloud.net"
          : req.body.Servidor,
      port:
        req.body.Servidor == "node68404-cliente.jelastic.saveincloud.net,11051"
          ? "11051"
          : "1433",
      dialect: "mssql",
      pool: { max: 15, min: 0, acquire: 30000, idle: 10000 },
    }
  );

  var erro = "";

  const buscaBase = await connFilial
    .query(
      `SELECT * FROM Usuarios where SUBSTRING(UsWhatsApp,3,50)='${req.body.Telefone}'`,
      {
        type: QueryTypes.SELECT,
      }
    )
    .then((data) => {
      return { idUsuario: data[0].Usuarios_ID, nomeUsuario: data[0].UsNome };
    })
    .catch((err) => {
      erro = err.message;
      return err.message;
    });

  if (!erro == "") res.status(400).json({ mensagem: erro });
  else if (!buscaBase)
    res.status(400).json({ mensagem: "Usuário não localizado!" });
  else res.status(200).json(buscaBase);
}; // end retorna usuario

exports.novoContatoSite = async (req, res) => {
  var nome = req.body.nome;
  var email = req.body.email;
  var telefone = req.body.telefone;
  var assunto = req.body.assunto;
  var mensagem = req.body.mensagem;

  var remetente = nodemailer.createTransport({
    host: "smtp.hostinger.com.br",
    service: "smtp.hostinger.com.br",
    port: 587,
    secure: true,
    auth: {
      user: "jon.engenharia@calltech.xyz",
      pass: "k3k5x32@#",
    },
  });

  var emailASerEnviado = {
    from: "jon.engenharia@calltech.xyz’",
    to: "vendas@calltech.xyz",
    subject: "Formulário Site - API",
    text: "Estou te enviando este email com node.js",
  };

  remetente.sendMail(emailASerEnviado, function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email enviado com sucesso.");
    }
  });

  res.status(200).json("ok");
};
