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
        defaultValue: (normalizedDate = new Date(Date.now()).toLocaleString(
          "eu-US",
          {
            timeZone: "America/Sao_Paulo",
          }
        )),
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
        // get: function () {
        //   // or use get(){ }
        //   return this.getDataValue("ClPrimeiroAcesso").toLocaleDateString(
        //     "pt-br"
        //   );
        // },
        // set: function () {
        //   // or use get(){ }
        //   return this.getDataValue("ClUltimoAcesso").toLocaleDateString(
        //     "pt-br"
        //   );
        // },
      },
      ClUltimoAcesso: {
        type: Sequelize.STRING,
        // get: function () {
        //   // or use get(){ }
        //   return this.getDataValue("ClUltimoAcesso").toLocaleDateString(
        //     "pt-br"
        //   );
        // },
        // set: function () {
        //   // or use get(){ }
        //   return this.getDataValue("ClUltimoAcesso").toLocaleDateString(
        //     "pt-br"
        //   );
        // },
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
