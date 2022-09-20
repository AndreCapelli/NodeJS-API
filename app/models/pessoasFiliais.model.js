module.exports = (sequelize, Sequelize) => {
  const PessoasFiliais = sequelize.define(
    "PessoasFiliais",
    {
      PessoasFiliais_ID: {
        type: Sequelize.INTEGER,
        field: "PessoasFiliais_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      PePessoasID: {
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

  PessoasFiliais.removeAttribute("id");
  return PessoasFiliais;
};
