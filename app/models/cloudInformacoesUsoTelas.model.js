module.exports = (sequelize, Sequelize) => {
  const CloudInformacoesUsoTelas = sequelize.define(
    "CloudInformacoesUsoTelas",
    {
      CloudInformacoesUsoTelas_ID: {
        type: Sequelize.INTEGER,
        field: "CloudInformacoesUsoTelas_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      ClPessoasID: {
        type: Sequelize.STRING,
      },
      ClDataAtualizacao: {
        type: Sequelize.STRING,
        defaultValue: (normalizedDate = new Date(Date.now()).toISOString()),
      },
      ClPessoasFiliaisID: {
        type: Sequelize.STRING,
      },
      ClUsuarioID: {
        type: Sequelize.STRING,
      },
      ClUsuario: {
        type: Sequelize.STRING,
      },
      ClEmpresaCNPJ: {
        type: Sequelize.STRING,
      },
      ClRazaoEmpresa: {
        type: Sequelize.STRING,
      },
      ClFormulariosID: {
        type: Sequelize.STRING,
      },
      ClFoNome: {
        type: Sequelize.STRING,
      },
      ClQuantidadeAcessos: {
        type: Sequelize.INTEGER,
      },
      ClPrimeiroAcesso: {
        type: Sequelize.STRING,
      },
      ClUltimoAcesso: {
        type: Sequelize.STRING,
      },
      ClDuracaoTotal: {
        type: Sequelize.STRING,
      },
      ClFoCaption: {
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

  CloudInformacoesUsoTelas.removeAttribute("id");
  return CloudInformacoesUsoTelas;
};
