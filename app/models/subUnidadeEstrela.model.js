module.exports = (sequelize, Sequelize) => {
  const SubUnidadesEstrela = sequelize.define(
    "IntegracoesEstrelaSUBUnidades",
    {
      IntegracoesEstrelaSUBUnidades_ID: {
        type: Sequelize.INTEGER,
        field: "IntegracoesEstrelaSUBUnidades_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      InNomeSub: {
        type: Sequelize.STRING,
      },
      InObs: {
        type: Sequelize.STRING,
      },
      InIntegracoesEstrelaUnidadesID: {
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

  SubUnidadesEstrela.removeAttribute("id");
  return SubUnidadesEstrela;
};
