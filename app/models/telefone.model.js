module.exports = (sequelize, Sequelize) => {
  const Telefone = sequelize.define(
    "PessoasContatos",
    {
      PessoasContatos_ID: {
        type: Sequelize.INTEGER,
        field: "PessoasContatos_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      PesPessoasID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      PesContato: {
        type: Sequelize.STRING,
      },
      PesDDD: {
        type: Sequelize.STRING,
      },
      PesTelefone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      PesEmail: {
        type: Sequelize.STRING,
      },
      PesDataCad: {
        type: Sequelize.STRING,
        defaultValue: (normalizedDate = new Date(Date.now()).toLocaleString(
          "eu-US",
          {
            timeZone: "America/Sao_Paulo",
          }
        )),
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

  Telefone.removeAttribute("id");
  return Telefone;
};
