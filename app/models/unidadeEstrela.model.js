module.exports = (sequelize, Sequelize) => {
  const UnidadesEstrela = sequelize.define(
    "IntegracoesEstrelaUnidades",
    {
      IntegracoesEstrelaUnidades_ID: {
        type: Sequelize.INTEGER,
        field: "IntegracoesEstrelaUnidades_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      InNome: {
        type: Sequelize.STRING,
      },
      InAtivo: {
        type: Sequelize.BOOLEAN,
      },
      InDescricao: {
        type: Sequelize.STRING,
      },
      InMatriz: {
        type: Sequelize.STRING,
      },
      InObrigaSubUnidades: {
        type: Sequelize.BOOLEAN,
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

  UnidadesEstrela.removeAttribute("id");
  return UnidadesEstrela;
};
