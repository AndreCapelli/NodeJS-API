module.exports = (sequelize, Sequelize) => {
  const CloudAlertaVersoes = sequelize.define(
    "CloudAlertaVersoes",
    {
      CloudAlertaVersoes_ID: {
        type: Sequelize.INTEGER,
        field: "CloudAlertaVersoes_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      ClCNPJ: {
        type: Sequelize.STRING,
      },
      ClUsuario: {
        type: Sequelize.STRING,
      },
      ClVersao: {
        type: Sequelize.STRING,
      },
      ClData: {
        type: Sequelize.STRING,
        defaultValue: (normalizedDate = new Date(Date.now()).toLocaleString(
          "eu-US",
          {
            timeZone: "America/Sao_Paulo",
          }
        )),
      },
      ClFilial: {
        type: Sequelize.STRING,
      },
      ClNomaMaquina: {
        type: Sequelize.STRING,
      },
      ClBaseDados: {
        type: Sequelize.STRING,
      },
      ClSistema: {
        type: Sequelize.STRING,
      },
    },
    {
      // don't add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,

      // If don't want createdAt
      createdAt: false,

      // If don't want updatedAt
      updatedAt: false,
    }
  );

  CloudAlertaVersoes.removeAttribute("id");
  return CloudAlertaVersoes;
};
