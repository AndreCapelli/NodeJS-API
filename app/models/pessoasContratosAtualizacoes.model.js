module.exports = (sequelize, Sequelize) => {
  const PessoasContratosAtualizacoes = sequelize.define(
    "PessoasContratosAtualizacoes",
    {
      PessoasContratosAtualizacoes_ID: {
        type: Sequelize.INTEGER,
        field: "PessoasContratosAtualizacoes_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      PePessoasContratosID: {
        type: Sequelize.STRING,
      },
      PeDataAtivacao: {
        type: Sequelize.STRING,
        // defaultValue: (normalizedDate = new Date(Date.now()).toISOString()),
        defaultValue: (normalizedDate = new Date(Date.now()).toLocaleString(
          "eu-US",
          {
            timeZone: "America/Sao_Paulo",
          }
        )),
      },
      PeVersaoAtual: {
        type: Sequelize.STRING,
      },
      PeMaquina: {
        type: Sequelize.STRING,
      },
      PeResultado: {
        type: Sequelize.BOOLEAN,
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

  PessoasContratosAtualizacoes.removeAttribute("id");
  return PessoasContratosAtualizacoes;
};
