module.exports = (sequelize, Sequelize) => {
  const EstrelaRotas = sequelize.define(
    "EstrelaRotas",
    {
      EstrelaRotas_ID: {
        type: Sequelize.INTEGER,
        field: "EstrelaRotas_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      EsNome: {
        type: Sequelize.STRING,
      },
      EsIntegracoesEstrelaUnidadesID: {
        type: Sequelize.INTEGER,
      },
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
  EstrelaRotas.removeAttribute("id");
  return EstrelaRotas;
};
