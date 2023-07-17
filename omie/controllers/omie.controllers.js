const db = require("../models/index");
const sequelize = db.sequelize;
const { QueryTypes, json, IndexHints } = require("sequelize");

exports.OmiePedido = async (req, res) => {
  console.log("Pedido: " + JSON.stringify(req.body));

  if (JSON.stringify(req.body) != '{"ping":"omie"}') {
    var codigo = req.body.event.idPedido.toString();
    codigo = codigo.replace(" ", "");

    async function apagar() {
      await sequelize
        .query(
          `DELETE FROM WHERE inSetor = 'Pedido' AND Replace(inCodigo,' ','') =
      '${codigo}'`,
          {
            type: QueryTypes.DELETE,
          }
        )
        .catch((err) => {
          res.status(500).json({
            message: err.message + " Omie!",
          });
        });
    }

    await apagar();

    async function insereContato() {
      await sequelize
        .query(
          `INSERT INTO integracao_Omie (inJson, inSetor, inData, inDescricaoEtapa, inCodigo) 
          Values ('${JSON.stringify(req.body)}','Pedido', GetDate(),'${
            req.body.event.etapa + " - " + req.body.event.etapaDescr
          }','${codigo}')`,
          {
            type: QueryTypes.INSERT,
          }
        )
        .catch((err) => {
          res.status(500).json({
            message: err.message + " Omie!",
          });
        });
      return;
    }

    await insereContato();
  }

  res.status(200).send("ok");
};

exports.OmieProduto = async (req, res) => {
  if (JSON.stringify(req.body) != '{"ping":"omie"}') {
    var codigo = req.body.event.codigo_produto.toString();
    codigo = codigo.replace(" ", "");

    async function apagar() {
      console.log("apagando");
      await sequelize
        .query(
          `DELETE FROM integracao_Omie WHERE inSetor = 'Produto' AND Replace(inCodigo,' ','') =
        '${codigo}'`,
          {
            type: QueryTypes.DELETE,
          }
        )
        .catch((err) => {
          res.status(500).json({
            message: err.message + " Omie!",
          });
        });
    }

    await apagar();

    async function insereContato() {
      await sequelize
        .query(
          `INSERT INTO integracao_Omie (inJson, inSetor, inData, inCodigo) 
        Values ('${JSON.stringify(
          req.body
        )}','Produto', GetDate(),'${codigo}')`,
          {
            type: QueryTypes.INSERT,
          }
        )
        .catch((err) => {
          res.status(500).json({
            message: err.message + " Omie!",
          });
        });
      return;
    }

    await insereContato();
  }

  res.status(200).send("ok");
};

exports.OmieCliente = async (req, res) => {
  if (JSON.stringify(req.body) != '{"ping":"omie"}') {
    var codigo = req.body.event.codigo_cliente_omie
      .toString()
      .replace(/\s/g, "");
    codigo = codigo.replace(/\s/g, "");

    async function apagar() {
      await sequelize
        .query(
          `DELETE FROM WHERE inSetor = 'Cliente' AND Replace(inCodigo,' ','') =
    '${codigo}'`,
          {
            type: QueryTypes.DELETE,
          }
        )
        .catch((err) => {
          res.status(500).json({
            message: err.message + " Omie!",
          });
        });
    }

    await apagar();

    async function insereContato() {
      await sequelize
        .query(
          `INSERT INTO integracao_Omie (inJson, inSetor, inData, inCodigo) 
        Values ('${JSON.stringify(
          req.body
        )}','Cliente', GetDate(),'${codigo}')`,
          {
            type: QueryTypes.INSERT,
          }
        )
        .catch((err) => {
          res.status(500).json({
            message: err.message + " Omie!",
          });
        });
      return;
    }

    await insereContato();
  }

  res.status(200).send("ok");
};
