module.exports = (sequelize, Sequelize) => {
  const Pessoa = sequelize.define(
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
      PesEndereco: {
        type: Sequelize.STRING,
      },
      PesComplementoEndereco: {
        type: Sequelize.STRING,
      },
      PesEnderecoNumero: {
        type: Sequelize.STRING,
      },
      PesBairro: {
        type: Sequelize.STRING,
      },
      PesCidade: {
        type: Sequelize.STRING,
      },
      PesEstado: {
        type: Sequelize.STRING,
      },
      PesUF: {
        type: Sequelize.STRING,
      },
      PesCEP: {
        type: Sequelize.STRING,
      },
      DataCad: {
        type: Sequelize.STRING,
        defaultValue: (normalizedDate = new Date(Date.now()).toISOString()),
      },
    },
    {
      // don't add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,

      // If don't want createdAt
      createdAt: false,

      // If don't want updatedAt
      updatedAt: false,

      hasTrigger: true,
    }
  );

  Pessoa.removeAttribute("id");
  return Pessoa;
};
