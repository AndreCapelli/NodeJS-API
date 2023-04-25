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

exports.addZeroes = (num, len) => {
  var numberWithZeroes = String(num);
  var counter = numberWithZeroes.length;

  while (counter < len) {
    numberWithZeroes = "0" + numberWithZeroes;

    counter++;
  }

  return numberWithZeroes;
};

exports.RetornaIndiceTabela = async (
  MesDivida,
  TabelaIndiceID,
  DocumentoID
) => {
  let dataDivida = this.ArrumaData(MesDivida);
  dataDivida = dataDivida.split("/");
  const anoDivida = dataDivida[2];
  const mesDivida = dataDivida[1];

  const DateAtual = new Date();
  let mesAtual = DateAtual.getMonth();
  let anoAtual = DateAtual.getUTCFullYear();

  let indiceAntigo;
  let IndiceAtual;
  let nomeIndice;

  //nome indice
  const tabelaNome = await sequelize
    .query(
      `SELECT TaNome FROM TabelaIndicesEconomicos WITH(NOLOCK) 
  WHERE TabelaIndicesEconomicos_ID = ${TabelaIndiceID} `,
      { type: QueryTypes.SELECT }
    )
    .then((data) => {
      if (!data || data.length == 0) {
        nomeIndice = "";
      }
      //encontrou registro, trato o mesmo
      else {
        nomeIndice = data[0].TaNome;
      }
    })
    .catch((err) => {
      console.log("Erro ao capturar o nome do indice: " + err.message);
    });

  //indice antigo
  const tabelaIndiceantigo = await sequelize
    .query(
      `SELECT TOP 1 *, TaNome FROM TabelaIndicesEconomicosMatriz T WITH(NOLOCK) 
    INNER JOIN TabelaIndicesEconomicos WITH(NOLOCK) ON TaIndicesEconomicosID = TabelaIndicesEconomicos_ID
    WHERE TaIndicesEconomicosID = ${TabelaIndiceID} AND ISNULL(TaIndice,'') <> '' AND TaAno = ${anoDivida} AND convert(int,TaMes) = ${mesDivida}`,
      { type: QueryTypes.SELECT }
    )
    .then((data) => {
      if (!data || data.length == 0) {
        console.log("Indice antigo não encontrado");
        indiceAntigo = 0;
        return 0;
      }
      //encontrou registro, trato o mesmo
      else {
        indiceAntigo = data[0].TaIndice;
        if (indiceAntigo === 0) {
          console.log("Indice antigo = 0");
          indiceAntigo = 0;
          return 0;
        }
      }
    })
    .catch((err) => {
      console.log("Erro indice antigo: " + err.message);
      return -1;
    });
  //fim indice antigo

  //indice atual
  const tabelaIndiceAtual = await sequelize
    .query(
      `SELECT TOP 1 * FROM TabelaIndicesEconomicosMatriz T WITH(NOLOCK) 
    WHERE TaIndicesEconomicosID = ${TabelaIndiceID} AND ISNULL(TaIndice,'') <> '' /*AND TaAno = ${anoAtual} AND convert(int,TaMes) = ${mesAtual}*/ order by TaAno Desc, TaMes Desc`,
      { type: QueryTypes.SELECT }
    )
    .then((data) => {
      if (!data || data.length == 0) {
        console.log("Indice atual não encontrado");
        indiceAntigo = 0;
        IndiceAtual = 0;
        return 0;
      }
      //encontrou registro, trato o mesmo
      else {
        IndiceAtual = data[0].TaIndice;
        if (indiceAntigo == 0) {
          console.log("Indice atual = 0");
          indiceAntigo = 0;
          return 0;
        }
      }
    })
    .catch((err) => {
      console.log("Erro indice atual: " + err.message);
      return -1;
    });
  //fim indice atual

  if (IndiceAtual == 0 || indiceAntigo == 0) return 0;

  console.log("Chegou aqui");

  const IndiceFinal = parseFloat(
    parseFloat(IndiceAtual) / parseFloat(indiceAntigo)
  );

  console.log("indice Final: " + IndiceFinal);

  if (nomeIndice != "IPCA") return IndiceFinal;
  else IndiceAtual;
};
