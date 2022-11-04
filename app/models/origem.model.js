module.exports = (sequelize, Sequelize) => {
  const Origem = sequelize.define(
    "Origens",
    {
      Origens_ID: {
        type: Sequelize.INTEGER,
        field: "Origens_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      OrNome: {
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

  Origem.removeAttribute("id");
  return Origem;
};
