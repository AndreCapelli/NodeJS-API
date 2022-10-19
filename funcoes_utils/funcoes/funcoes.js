const db = require("../../portal/models/index");
const sequelize = db.sequelize;
const { QueryTypes } = require("sequelize");

exports.fnc_RetiraNumerosString = function (text) {
  return text.replace(/\D+/g, "");
};

exports.ArrumaData = (Data) => {
  const dtOne = Data.split("-");

  return dtOne[2] + "/" + dtOne[1] + "/" + dtOne[0];
};

exports.RetornaData = () => {
  const date = new Date(Date.now())
    .toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    })
    .split(" ");

  return date[0];
};

exports.CalculaDias = (DateOne, DateTwo) => {
  const dtOne = DateOne.split("/");
  const dtTwo = DateTwo.split("/");

  const dateDiff = Math.abs(
    new Date(dtOne[2], Number(dtOne[1]) - 1, dtOne[0]) -
      new Date(dtTwo[2], Number(dtTwo[1]) - 1, dtTwo[0])
  );
  const day = 24 * 60 * 60 * 1000;

  return Math.round(dateDiff / day);
};

exports.IncYear = (Data, Inc) => {
  const dtOne = Data.split("/");
  const date = new Date(dtOne[2], Number(dtOne[1]) - 1, dtOne[0]);
  const dateResult = new Date(date.setFullYear(date.getFullYear() + Inc))
    .toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    })
    .split(" ");

  return dateResult[0];
};

exports.IncMonth = (Data, Inc) => {
  const dtOne = Data.split("/");
  const date = new Date(dtOne[2], Number(dtOne[1]) - 1, dtOne[0]);
  const dateResult = new Date(date.setMonth(date.getMonth() + Inc))
    .toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    })
    .split(" ");

  return dateResult[0];
};

exports.IncDay = (Data, Inc) => {
  const dtOne = Data.split("/");
  const date = new Date(dtOne[2], Number(dtOne[1]) - 1, dtOne[0]);
  const dateResult = new Date(date.setDate(date.getDate() + Inc))
    .toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    })
    .split(" ");

  return dateResult[0];
};

exports.RetornaIndiceTabela = async (
  MesDivida,
  TabelaIndiceID,
  DocumentoID
) => {
  if (!TabelaIndiceID) {
    return {
      TaIndicesEconomicosID: TabelaIndiceID,
      TaAno: "",
      TaMes: "",
      TaIndice: 0,
      TaNome: "Indice não passado",
    };
  }

  let dataDivida = this.ArrumaData(MesDivida);
  dataDivida = dataDivida.split("/");
  const anoDivida = dataDivida[2];
  const mesDivida = dataDivida[1];

  const tabelaIndice = await sequelize
    .query(
      `SELECT TOP 1 * FROM TabelaIndicesEconomicosMatriz WITH(NOLOCK) 
        INNER JOIN TabelaIndicesEconomicos WITH(NOLOCK) ON TaIndicesEconomicosID = TabelaIndicesEconomicos_ID
        WHERE TaIndicesEconomicosID = ${TabelaIndiceID} AND ISNULL(TaIndice,'') <> '' 
        ORDER BY TaAno DESC, TaMes DESC`,
      {
        type: QueryTypes.SELECT,
      }
    )
    .then((data) => {
      return !data || data.length == 0
        ? {
            TaIndicesEconomicosID: TabelaIndiceID,
            TaAno: anoDivida,
            TaMes: mesDivida,
            TaIndice: 0,
            TaNome: "Nenhum Indice Encontrado ",
          }
        : data[0];
    })
    .catch((err) => {
      return {
        TaIndicesEconomicosID: TabelaIndiceID,
        TaAno: anoDivida,
        TaMes: mesDivida,
        TaIndice: -1,
        TaNome: "Erro " + err.message,
      };
    });

  return tabelaIndice;
};
