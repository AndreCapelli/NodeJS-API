module.exports = (sequelize, Sequelize) => {
  const Pessoas = sequelize.define(
    "Pessoas",
    {
      Pessoas_ID: {
        type: Sequelize.INTEGER,
        field: "Pessoas_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      FPesNome: {
        type: Sequelize.STRING,
      },
      FPesApelido: {
        type: Sequelize.STRING,
      },
      FPesCPF: {
        type: Sequelize.STRING,
      },
      JPesRazaoSocial: {
        type: Sequelize.STRING,
      },
      JPesNomeFantasia: {
        type: Sequelize.STRING,
      },
      JPesCNPJ: {
        type: Sequelize.STRING,
      },
      PesTipoPessoa: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      createdAt: false,
      updatedAt: false,
      hasTrigger: true,
    }
  );

  Pessoas.removeAttribute("id");
  return Pessoas;
};
