const db = require("../models/index");
const sequelize = db.sequelize;
const { QueryTypes, json, IndexHints } = require("sequelize");

exports.OmiePedido = async (req, res) => {
  console.log("Pedido: " + req.body);

  async function insereContato() {
    await sequelize
      .query(
        `INSERT INTO integracao_Omie (inJson, inSetor, inData) 
        Values ('${JSON.stringify(req.body)}','Pedido', GetDate())`,
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

  res.status(200).send("ok");
};

exports.OmieProduto = async (req, res) => {
  console.log("Produto: " + req.body);
  res.status(200).send("ok");
};

exports.OmieCliente = async (req, res) => {
  console.log("Produto: " + req.body);
  res.status(200).send("ok");
};
