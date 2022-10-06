const funcoes = require("../funcoes/funcoes");

const CalcDataVencimento = [];
const CalcValorParcela = [];
const CalcValorJuros = [];
const CalcDiasParcela = [];
const CalcValorTotalParcela = [];

exports.CalcDataVencimento = CalcDataVencimento;
exports.CalcValorParcela = CalcValorParcela;
exports.CalcValorJuros = CalcValorJuros;
exports.CalcDiasParcela = CalcDiasParcela;
exports.CalcValorTotalParcela = CalcValorTotalParcela;

exports.CalculaJuros = (Valor, Juros, Dias, Tipo) => {
  let li, nDias, vJuros;

  if (Tipo == "C") {
    li = Juros / 100;
    nDias = Dias / 30;
    vJuros = Valor * Math.pow(1 + li, nDias) - Valor;
  } else {
    vJuros = ((Valor * Juros) / 3000) * Dias;
  }
  return vJuros;
};

exports.CalculaMulta = (Valor, Multa) => {
  return (Valor / 100) * Multa;
};

exports.CalculaCorrecao = (Valor, Correcao) => {
  return Valor * Correcao - Valor;
};

exports.CalculaHonorarios = (Valor, Honorarios) => {
  return (Valor / 100) * Honorarios;
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

  return true;
};
