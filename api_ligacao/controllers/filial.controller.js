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

  console.log(nome);
  res.status(200).json(req);

  /*  var remetente = nodemailer.createTransport({
    host: "smtp.hostinger.com.br",
    service: "smtp.hostinger.com.br",
    port: 587,
    secure: false,
    auth: {
      user: "contato@calltech.xyz",
      pass: "07_tecHxyz",
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  var emailASerEnviado = {
    from: "contato@calltech.xyz",
    to: "site@calltech.xyz",
    subject: "Formulário Site - API",
    text:
      "nome: " +
      nome +
      "\ntelefone: " +
      telefone +
      "\nemail: " +
      email +
      "\nassunto: " +
      assunto +
      "\n mensagem: " +
      mensagem,
  };

  remetente.sendMail(emailASerEnviado, async function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email enviado com sucesso.");
    }
  });

  if (nome != "") {
    console.log(nome + " entrou");

    // insere pessoa
    await sequelize
      .query(
        `INSERT INTO Pessoas (FPesNome, JPesRazaoSocial, PesTipoPessoa, PesOrigem) 
        Values ('${nome}','${nome}', 'J', 5) `,
        {
          type: QueryTypes.INSERT,
        }
      )
      .catch((err) => {
        res.status(500).json({
          message: err.message + " Pessoa não inserida!",
        });
      });

    var idPessoa;
    await sequelize
      .query("select Ident_Current('Pessoas') as PessoaID", {
        type: QueryTypes.SELECT,
      })
      .then((data) => {
        idPessoa = data[0].PessoaID;
      });
  }

  if (idPessoa != "") {
    await sequelize.query(
      "Update Pessoas SET FPesCPF='2102" +
        idPessoa +
        "', JPesCNPJ='2102" +
        idPessoa +
        "',  PesComplementoPessoa ='Assunto: " +
        assunto +
        "\n Mensagem: " +
        mensagem +
        "\n Telefone: " +
        telefone +
        " - email: " +
        email +
        "' Where Pessoas_ID=" +
        idPessoa,
      { type: QueryTypes.UPDATE }
    );
  }

  if (email !== "" || telefone !== "") {
    var ddd;

    if (telefone.length == 10 || telefone.length == 11) {
      ddd = telefone.substring(0, 2);
      telefone = telefone.substring(2, 20);
      console.log(ddd + " " + telefone);
    }
  }

  await sequelize.query(
    "INSERT INTO PessoasContatos (PesPessoasID, PesContato, PesTelefone, PesDDD, PesEmail, PesOrigemContato) " +
      "Values(" +
      idPessoa +
      ",'" +
      nome +
      "','" +
      telefone +
      "','" +
      ddd +
      "','" +
      email +
      "'," +
      "'Site - API')",
    { type: QueryTypes.INSERT }
  );

  res.status(200).json("ok");*/
};
