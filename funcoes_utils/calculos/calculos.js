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
  Juros
) => {};
