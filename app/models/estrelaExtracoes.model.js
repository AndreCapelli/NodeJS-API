module.exports = (sequelize, Sequelize) => {
  const EstrelaExtracoes = sequelize.define(
    "EstrelaExtracoes",
    {
      EstrelaExtracoes_ID: {
        type: Sequelize.INTEGER,
        field: "EstrelaExtracoes_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      EsNumero: {
        type: Sequelize.STRING,
      },
      EsDataSorteio: {
        type: Sequelize.STRING,
      },
      EsStatus: { type: Sequelize.INTEGER },
    },
    {
      // Abaixo são os campos de tempo/ hora nativos do Sequelize
      // Insert sem esse campo
      timestamps: false,

      // Insert sem esse campo
      createdAt: false,

      // Insert sem esse campo
      updatedAt: false,

      // Sempre colocar em tabelas que possuem triggers, dessa forma o Sequelize trata sozinho tudo que faz o disparo dela
      hasTrigger: true,
    }
  );

  EstrelaExtracoes.removeAttribute("id");
  return EstrelaExtracoes;
};
