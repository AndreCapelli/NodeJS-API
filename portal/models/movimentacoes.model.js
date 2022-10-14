module.exports = (sequelize, Sequelize) => {
  const Movimentacoes = sequelize.define(
    "Movimentacoes",
    {
      Movimentacoes_ID: {
        type: Sequelize.INTEGER,
        field: "Movimentacoes_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      MoInadimplentesID: {
        type: Sequelize.STRING,
      },
      MoClientesID: {
        type: Sequelize.STRING,
      },
      MoValorDocumento: {
        type: Sequelize.DOUBLE,
      },
      MoNumeroDocumento: {
        type: Sequelize.STRING,
      },
      MoDataVencimento: {
        type: Sequelize.STRING,
        defaultValue: (normalizedDate = new Date(Date.now()).toLocaleString(
          "eu-US",
          {
            timeZone: "America/Sao_Paulo",
          }
        )),
      },
      MoTipoDocumento: {
        type: Sequelize.STRING,
      },
      MoPercentualJuros: {
        type: Sequelize.INTEGER,
      },
      MoPercentualMulta: {
        type: Sequelize.INTEGER,
      },
      MoPercentualHonorarios: {
        type: Sequelize.INTEGER,
      },
      MoPercentualCorrecao: {
        type: Sequelize.INTEGER,
      },
      MoStatusMovimentacao: {
        type: Sequelize.INTEGER,
      },
      MoOrigemMovimentacao: {
        type: Sequelize.STRING,
      },
    },
    {
      timestamps: false,
      createdAt: false,
      updatedAt: false,
      hasTrigger: true,
    }
  );

  Movimentacoes.removeAttribute("id");
  return Movimentacoes;
};
