module.exports = (sequelize, Sequelize) => {
  const ExtracoesDivisoes = sequelize.define(
    "ExtracoesDivisoes",
    {
      ExtracoesDivisoes_ID: {
        type: Sequelize.INTEGER,
        field: "ExtracoesDivisoes_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      ExEstrelaExtracoesID: {
        type: Sequelize.INTEGER,
      },
      EsTipoPessoa: {
        type: Sequelize.INTEGER,
      },
      EsPessoasID: {
        type: Sequelize.INTEGER,
      },
      EsOrigem: {
        type: Sequelize.STRING,
      },
      EsUnidadesID: { type: Sequelize.INTEGER },
      EsDataDivisao: {
        type: Sequelize.STRING,
        defaultValue: (normalizedDate = new Date(Date.now()).toLocaleString(
          "eu-US",
          {
            timeZone: "America/Sao_Paulo",
          }
        )),
      },
      EsUsuariosID: { type: Sequelize.INTEGER },
      EsInicio: { type: Sequelize.INTEGER },
      EsQuantidade: { type: Sequelize.INTEGER },
      EsFinal: { type: Sequelize.INTEGER },
      EsConcretizado: { type: Sequelize.BOOLEAN },
      EsRangeCancelado: { type: Sequelize.INTEGER },
      EsDataCancelamento: {
        type: Sequelize.STRING,
      },
    },
    {
      // Abaixo são os campos de tempo/ hora nativos do Sequelize
      // Insert sem esse campo
      timestamps: false,

      // Insert sem esse campo
      createdAt: false,

      // Insert sem esse campo
      updatedAt: false,

      // Sempre colocar em tabelas que possuem triggers, dessa forma o Sequelize trata sozinho tudo que faz o disparo dela
      hasTrigger: true,
    }
  );

  ExtracoesDivisoes.removeAttribute("id");
  return ExtracoesDivisoes;
};
