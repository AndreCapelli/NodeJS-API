const funcoes = require("../funcoes/funcoes");

const db = require("../../portal/models/index");
const Movimentacoes = db.movimentacoes;
const Politicas = db.politicas;
const Op = db.Sequelize.Op;

const sequelize = db.sequelize;
const { QueryTypes, json, IndexHints } = require("sequelize");

const CalcDataVencimento = [];
const CalcValorParcela = [];
const CalcValorJuros = [];
const CalcDiasParcela = [];
const CalcValorTotalParcela = [];
const AtualizaDocumento = [];

exports.CalcDataVencimento = CalcDataVencimento;
exports.CalcValorParcela = CalcValorParcela;
exports.CalcValorJuros = CalcValorJuros;
exports.CalcDiasParcela = CalcDiasParcela;
exports.CalcValorTotalParcela = CalcValorTotalParcela;
exports.AtualizaDocumento = AtualizaDocumento;

exports.CalculaJuros = (Valor, Juros, Dias, Tipo) => {
  let li, nDias, vJuros;

  console.log(
    "Valor: " + Valor + " Juros: " + Juros + " Dias: " + Dias + "Tipo: " + Tipo
  );

  if (Tipo == "C") {
    li = Juros / 100;
    nDias = Dias / 30;
    vJuros = Valor * Math.pow(1 + li, nDias) - Valor;
  } else {
    vJuros = ((Valor * Juros) / 3000) * Dias;
  }

  vJuros = vJuros.toFixed(2);
  console.log("Vjuros: " + vJuros);

  return vJuros;
};

exports.CalculaMulta = (Valor, Multa) => {
  let vMulta = (Valor / 100) * Multa;
  return vMulta.toFixed(2);
};

exports.CalculaCorrecao = (Valor, Correcao) => {
  console.log(Valor);
  const Resultado = Valor * Correcao == 0 ? 1 : Valor * Correcao - Valor;
  return Resultado.toFixed(2);
};

exports.CalculaHonorarios = (Valor, Honorarios) => {
  var Retorno = (Valor / 100) * Honorarios;
  return Retorno.toFixed(2);
};

exports.CalculaACI = (VAI, VO) => {
  return VAI - VO;
};

exports.CalculaRAC = (RVF, VO) => {
  return RVF - VO;
};

exports.CaculaIndice = (Valor, ACI) => {
  return Valor / ACI;
};

exports.CalculaValorReverso = (RAC, INDICE) => {
  return RAC * INDICE;
};

exports.CalculaJurosReverso = (RVFJ, DA, VO, Tipo) => {
  const calculo =
    Tipo == "S"
      ? { vCalcPorcentagem: (RVFJ * 30 * 100) / (DA * VO) }
      : {
          vCalcPorcentagem:
            ((Math.pow(VO + RVFJ, 1 / (DA / 30)) -
              Math.pow(VO, 1 / (DA / 30))) *
              100) /
            Math.pow(VO, 1 / (DA / 30)),
        };

  return calculo.vCalcPorcentagem;
};

exports.CalculaMultaReverso = (RVFM, VO) => {
  return RVFM / VO / 100;
};

exports.CalculaCorrecaoReverso = (RVFC, VO) => {
  return (RVFC + VO) / VO;
};

exports.CalculaHonorariosReverso = (RVFH, VO) => {
  return (RVFH / VO) * 100;
};

exports.CalculaPrice = (
  Valor,
  Parcelas,
  Periodicidade,
  Vencimento,
  Juros,
  FixarDia
) => {
  let vValorAtual = Valor;
  let vValor = Valor;
  let vValorParcela = Valor / Parcelas;
  let vValorTotal = Valor;
  let vJuros = 0;
  let vValorTotalJurosParcelas = 0;
  let vValorOriginalTotalParcelas = 0;
  let vValorTotalParcelas = 0;
  let vValorAtualParcela = 0;

  for (let index = 0; index < Parcelas; index++) {
    if (index == 0) {
      CalcDataVencimento[index] = Vencimento;
      CalcDiasParcela[index] = funcoes.CalculaDias(
        funcoes.RetornaData(),
        CalcDataVencimento[index]
      );
    } else {
      if (FixarDia) {
        CalcDataVencimento[index] = funcoes.IncMonth(Vencimento, index);
        CalcDiasParcela[index] = funcoes.CalculaDias(
          CalcDataVencimento[index],
          funcoes.RetornaData()
        );
      } else {
        CalcDataVencimento[index] = funcoes.IncDay(
          Vencimento,
          index * Periodicidade
        );
        CalcDiasParcela[index] = funcoes.CalculaDias(
          CalcDataVencimento[index],
          funcoes.RetornaData()
        );
      }
    }

    if (Juros == 0) {
      CalcValorParcela[index] = vValorParcela;
      vJuros = 0;
      CalcValorJuros[index] = 0;
      CalcValorTotalParcela[index] = vValorParcela;
    } else {
      CalcValorTotalParcela[index] = Math.round(
        (vValorAtual * (Juros / 100)) /
          (1 - 1 / Math.pow(1 + Juros / 100, Parcelas))
      );
      vJuros = Math.round((Juros / 100) * vValorTotal);
      CalcValorJuros[index] = vJuros;
      vValorAtualParcela = CalcValorTotalParcela[index] - vJuros;
      CalcValorParcela[index] = vValorAtualParcela;

      if (index == Parcelas - 1) {
        vValorAtualParcela = Math.round(vValorAtualParcela);

        if (vValorAtualParcela > vValorTotal) {
          vJuros = vJuros + (vValorAtualParcela - vValorTotal);
          CalcValorJuros[index] = vJuros;
          vValorAtualParcela = vValorTotal;
        } else if (vValorAtualParcela < vValorTotal) {
          vJuros = vJuros - (vValorTotal - vValorAtualParcela);
          CalcValorJuros[index] = Math.round(vJuros);
          vValorAtualParcela = vValorTotal;
          CalcValorParcela[index] = Math.round(vValorAtualParcela);
        }
      }
      vValorTotal = Math.round(
        vValorTotal - (CalcValorTotalParcela[index] - CalcValorJuros[index])
      );
    }
    vValorTotalJurosParcelas = vValorTotalJurosParcelas + CalcValorJuros[index];
    vValorTotalParcelas = vValorTotalParcelas + CalcValorTotalParcela[index];
    vValorOriginalTotalParcelas =
      vValorOriginalTotalParcelas + CalcValorParcela[index];
  }

  let resultRetorna = CalcDataVencimento.map((id, index) => {
    return {
      CalcDataVencimento: CalcDataVencimento[index],
      CalcValorParcela: CalcValorParcela[index],
      CalcValorJuros: CalcValorJuros[index],
      CalcDiasParcela: CalcDiasParcela[index],
      CalcValorTotalParcela: CalcValorTotalParcela[index],
    };
  });

  return resultRetorna;
};

exports.AtualizaDocumento = async (DocumentoID, PoliticaID) => {
  var politicas = await sequelize
    .query(
      `select *
  from PessoasPoliticaCobrancas WITH(NOLOCK) Where PessoasPoliticaCobrancas_ID = ${PoliticaID}`,
      {
        type: QueryTypes.SELECT,
      }
    )
    .then((data) => {
      if (data.length === 0) {
        res.status(400).send({ mensagem: "Nenhuma politica encontrada!" });
      } else {
        return data;
      }
    })
    .catch((err) => {
      console.log("Falha ao localizar politica " + err.message);
    }); // fim politica
  console.log(politicas.PeDescricao);

  var docs = await Movimentacoes.findAll({
    where: {
      Movimentacoes_ID: DocumentoID,
    },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message + " Algum erro aconteceu na busca dos Documentos!",
      });
    });

  var indiceCorrecao = await funcoes.RetornaIndiceTabela(
    docs.MoDataVencimento,
    politicas.PeTabelaIndicesEconomicosID,
    docs.Movimentacoes_ID
  );

  let ValorCorrecaoReal = parseFloat(
    calculos.CalculaCorrecao(docs.MoValorDocumento, indiceCorrecao)
  );

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
    docs.MoValorDocumento + ValorJurosReal + ValorMultaReal + ValorCorrecaoReal;

  if (politicas.PeHonorarioSobVA) {
    var ValorHonorarioReal = parseFloat(
      calculos.CalculaHonorarios(
        MoValorAtualizadoSemHonorario,
        politicas.PeHonorario
      )
    );
  } else {
    var ValorHonorarioReal = parseFloat(
      calculos.CalculaHonorarios(docs.MoValorDocumento, politicas.PeHonorario)
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
          calculos.CalculaHonorarios(ValorCorrecaoReal, politicas.PeHonorario)
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

  console.log(ValorAtualizadoTotal);

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
    MoValorAtualizadoSemHonorario:
      docs.MoValorDocumento +
      ValorJurosReal +
      ValorMultaReal +
      ValorCorrecaoReal,
    MoHonorariosPorcentagem: politicas.PeHonorario,
    MoValorHonorarios: ValorHonorarioReal,
    MoValorHonorarioSobJuros: ValorHonorariosSobJuros,
    MoValorHonorarioSobMulta: ValorHonorarioSobMulta,
    MoValorHonorarioSobCorrecao: ValorHonorarioSobCorrecao,
    MoValorHonorarioTotal: ValorHonorarioRealTotal,
    MoValorAtualizado: ValorAtualizadoTotal.toFixed(2),
    MoDataVencimento: docs.MoDataVencimento,
    MoNumeroDocumento: docs.MoNumeroDocumento,
    MoTipoDocumento: docs.MoTipoDocumento,
  };
};
