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
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      PesEmail: {
        type: Sequelize.BOOLEAN,
      },
      PesDataCad: {
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
    }
  );

  Telefone.removeAttribute("id");
  return Telefone;
};
