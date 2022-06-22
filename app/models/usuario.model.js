module.exports = (sequelize, Sequelize) => {
  const Usuario = sequelize.define(
    "Usuarios",
    {
      Usuarios_ID: {
        type: Sequelize.INTEGER,
        field: "Usuarios_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      UsNome: {
        type: Sequelize.STRING,
      },
      UsLogin: {
        type: Sequelize.STRING,
      },
      UsSenha: {
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

  Usuario.removeAttribute("id");
  return Usuario;
};
