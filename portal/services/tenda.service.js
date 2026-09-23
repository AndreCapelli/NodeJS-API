const axios = require("axios");
const { QueryTypes } = require("sequelize");

const TENDA_URL =
  "https://recupera.tenda.com.br/recupera/webservice/wsIntegracaoRecupera.asmx";
const TENDA_SOAP_ACTION =
  "http://localhost/recupera/webservice/IncluirOcorrencia";

/**
 * Reproduz o método Descript do Delphi. A senha da Tenda permanece criptografada
 * em ConfiguracoesSistemas e só é convertida em memória no momento da chamada.
 * Math.fround mantém a precisão Single usada pelo código legado.
 */
function descriptografarSenhaLegado(valor) {
  let resultado = "";
  let semente = Math.fround(0.2);

  for (const caractere of String(valor || "")) {
    let x = Math.fround(9821 * semente + 0.211327);
    semente = Math.fround(x - Math.trunc(x));
    x = Math.fround(Math.trunc(95 * semente) + 1);

    let codigo = caractere.charCodeAt(0) - Math.trunc(x);
    while (codigo >= 124) codigo -= 92;
    if (codigo < 32) codigo += 92;

    resultado += String.fromCharCode(codigo);
  }

  return resultado;
}

// Impede que histórico, motivo ou credenciais com caracteres especiais quebrem o XML.
function escaparXml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// O webservice devolve outro XML como texto dentro do envelope SOAP.
function decodificarXml(valor) {
  return String(valor ?? "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, "&");
}

// Aceita tags com ou sem prefixo de namespace, por exemplo soap:Body e Body.
function extrairTag(xml, tag) {
  const expressao = new RegExp(
    `<(?:[\\w-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w-]+:)?${tag}>`,
    "i"
  );
  const resultado = expressao.exec(xml);
  return resultado ? decodificarXml(resultado[1]).trim() : "";
}

/**
 * Extrai do SOAP apenas os campos usados pela regra:
 * RETORNO = código ("00" significa sucesso) e RETORNOTEXTO = mensagem da Tenda.
 */
function processarRespostaIncluirOcorrencia(xmlResposta) {
  const resultadoSoap = extrairTag(xmlResposta, "IncluirOcorrenciaResult");
  const xmlInterno = resultadoSoap || String(xmlResposta || "");

  return {
    codigo: extrairTag(xmlInterno, "RETORNO"),
    mensagem: extrairTag(xmlInterno, "RETORNOTEXTO"),
  };
}

// Limita o conteúdo retornado em erros para não poluir o log nem devolver uma
// página HTML/XML inteira na resposta da API.
function resumirRespostaErro(conteudo) {
  return String(conteudo || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

// O contrato da Tenda exige a data no formato local yyyy-MM-dd, sem horário.
function formatarDataTenda(data) {
  const dataFinal = data instanceof Date ? data : new Date(data);
  const ano = dataFinal.getFullYear();
  const mes = String(dataFinal.getMonth() + 1).padStart(2, "0");
  const dia = String(dataFinal.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Lê as mesmas configurações usadas pelo legado. A antiga flag que habilitava
 * a integração não é consultada; a decisão por campanha é feita no controller.
 */
async function buscarConfiguracao(sequelize) {
  const [configuracao] = await sequelize.query(
    `SELECT TOP 1
       CoTenda_LoginWS AS usuario,
       CoTenda_SenhaWS AS senhaCriptografada,
       CoTenda_EmpresaWs AS empresa,
       CoTenda_CodCredorWs AS credor
     FROM ConfiguracoesSistemas WITH (NOLOCK)`,
    { type: QueryTypes.SELECT }
  );

  if (!configuracao) {
    throw new Error("Configuração da integração Tenda não encontrada.");
  }

  const config = {
    usuario: configuracao.usuario,
    senha: descriptografarSenhaLegado(configuracao.senhaCriptografada),
    empresa: configuracao.empresa,
    credor: configuracao.credor,
  };

  // Interrompe somente a integração externa quando alguma credencial está ausente.
  const camposAusentes = Object.entries(config)
    .filter(([, valor]) => !String(valor || "").trim())
    .map(([campo]) => campo);

  if (camposAusentes.length > 0) {
    throw new Error(
      `Configuração da integração Tenda incompleta: ${camposAusentes.join(", ")}.`
    );
  }

  return config;
}

/**
 * Converte o R.O./motivo do MaxOne no código esperado pela Tenda.
 * A ordenação prioriza o mapeamento exato do motivo e usa o registro com
 * TeMotivosID nulo como fallback, exatamente como no Delphi.
 */
async function mapearOcorrencia(sequelize, resumoId, motivoId) {
  const [mapeamento] = await sequelize.query(
    `SELECT TOP 1
       TeCodigoRetorno AS codigo,
       TeMotivoRetorno AS motivo
     FROM dbo.TendaMapeamentoROs WITH (NOLOCK)
     WHERE ISNULL(TeAtivo, 1) = 1
       AND TeResumoDeOperacoesID = :resumoId
       AND (TeMotivosID = :motivoId OR TeMotivosID IS NULL)
     ORDER BY CASE WHEN TeMotivosID = :motivoId THEN 0 ELSE 1 END`,
    {
      replacements: {
        resumoId,
        motivoId: Number(motivoId) || 0,
      },
      type: QueryTypes.SELECT,
    }
  );

  return mapeamento || { codigo: "", motivo: "" };
}

/**
 * Monta e envia a operação IncluirOcorrencia via SOAP.
 * O REGIS recebe zeros à esquerda até completar 10 posições, conforme o legado.
 */
async function incluirOcorrencia({
  configuracao,
  codigo,
  regis,
  complemento,
  dataAgenda = new Date(),
  httpClient = axios,
}) {
  const regisFormatado = String(regis || "").padStart(10, "0");
  // XML de negócio recebido pelo parâmetro strXML do método SOAP.
  const xmlInterno =
    "<XML><OCORRENCIA>" +
    `<CODIGO>${escaparXml(codigo)}</CODIGO>` +
    `<CREDOR>${escaparXml(configuracao.credor)}</CREDOR>` +
    `<REGIS>${escaparXml(regisFormatado)}</REGIS>` +
    "<OPERADOR>MCSA</OPERADOR>" +
    `<COMPLEMENTO>${escaparXml(complemento)}</COMPLEMENTO>` +
    `<DATAAGENDA>${formatarDataTenda(dataAgenda)}</DATAAGENDA>` +
    "<FONEDISCADO>31999999999</FONEDISCADO>" +
    "<CODCONTRATOVINCULAR></CODCONTRATOVINCULAR>" +
    "<CODPRODUVINCULAR>FATURA</CODPRODUVINCULAR>" +
    "<BLOQUEIOCONTRATO>false</BLOQUEIOCONTRATO>" +
    "</OCORRENCIA><login>" +
    `<uid>${escaparXml(configuracao.usuario)}</uid>` +
    `<pwd>${escaparXml(configuracao.senha)}</pwd>` +
    `<empresa>${escaparXml(configuracao.empresa)}</empresa>` +
    "</login></XML>";

  // Envelope exigido pelo webservice ASMX. O XML de negócio vai dentro de CDATA.
  const requisicaoSoap =
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" ' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    'xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
    '<soap:Body>' +
    '<IncluirOcorrencia xmlns="http://localhost/recupera/webservice/">' +
    `<strXML><![CDATA[${xmlInterno}]]></strXML>` +
    "</IncluirOcorrencia></soap:Body></soap:Envelope>";

  // O timeout evita deixar o endpoint registrarResumo preso indefinidamente se o
  // serviço estiver indisponível. Pode ser ajustado por TENDA_TIMEOUT_MS.
  let resposta;

  try {
    resposta = await httpClient.post(TENDA_URL, requisicaoSoap, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: `"${TENDA_SOAP_ACTION}"`,
      },
      timeout: Number(process.env.TENDA_TIMEOUT_MS) || 30000,
      // SOAP pode devolver detalhes úteis no corpo mesmo com HTTP 500. Receber a
      // resposta aqui permite extrair a mensagem antes de gerar nosso próprio erro.
      validateStatus: () => true,
    });
  } catch (error) {
    const detalhe = error.message || error.code || String(error) || "sem detalhes";
    throw new Error(`Falha de comunicação com a Tenda: ${detalhe}`);
  }

  if (resposta.status < 200 || resposta.status >= 300) {
    const falhaSoap = extrairTag(resposta.data, "faultstring");
    const detalhe = falhaSoap || resumirRespostaErro(resposta.data) || resposta.statusText;
    throw new Error(
      `Tenda respondeu HTTP ${resposta.status}${detalhe ? `: ${detalhe}` : ""}`
    );
  }

  const resultado = processarRespostaIncluirOcorrencia(resposta.data);

  if (!resultado.codigo) {
    throw new Error(
      `Resposta da Tenda sem o campo RETORNO: ${resumirRespostaErro(resposta.data) || "corpo vazio"}`
    );
  }

  return resultado;
}

module.exports = {
  buscarConfiguracao,
  incluirOcorrencia,
  mapearOcorrencia,
  processarRespostaIncluirOcorrencia,
  descriptografarSenhaLegado,
};
