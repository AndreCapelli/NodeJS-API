const db = require("../models/index");
const sequelize = db.sequelize;
const { QueryTypes, json, IndexHints } = require("sequelize");

exports.OmiePedido = async (req, res) => {
  console.log("Pedido: " + JSON.stringify(req.body));

  if (JSON.stringify(req.body) != '{"ping":"omie"}') {
    async function insereContato() {
      await sequelize
        .query(
          `INSERT INTO integracao_Omie (inJson, inSetor, inData, inDescricaoEtapa, inCodigo) 
          Values ('${JSON.stringify(req.body)}','Pedido', GetDate(),' ${
            req.body.event.etapa + " - " + req.body.event.etapaDescr
          }',' ${req.body.event.idPedido}')`,
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
    async function insereContato() {
      await sequelize
        .query(
          `INSERT INTO integracao_Omie (inJson, inSetor, inData, inDescricaoEtapa, inCodigo) 
        Values ('${JSON.stringify(req.body)}','Produto', GetDate(),' ${
            /*req.body.event.etapa +*/ " - " /*+ req.body.event.etapaDescr*/
          }',' */${req.body.event.idPedido}/*5050')`,
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
    async function insereContato() {
      await sequelize
        .query(
          `INSERT INTO integracao_Omie (inJson, inSetor, inData, inDescricaoEtapa, inCodigo) 
        Values ('${JSON.stringify(req.body)}','Cliente', GetDate(),' ${
            /*req.body.event.etapa +*/ " - " /*+ req.body.event.etapaDescr*/
          }',' */${req.body.event.idPedido}/*5050')`,
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
