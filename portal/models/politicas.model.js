module.exports = (sequelize, Sequelize) => {
  const politicas = sequelize.define(
    "PessoasPoliticaCobrancas",
    {
      PessoasPoliticaCobrancas_ID: {
        type: Sequelize.INTEGER,
        field: "PessoasPoliticaCobrancas_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      PePessoasID: {
        type: Sequelize.INTEGER,
      },
      PeTipoJuros: {
        type: Sequelize.STRING,
      },
      PeDescricao: {
        type: Sequelize.STRING,
      },
      PeCorrecao: {
        type: Sequelize.DOUBLE,
      },
      PeJuros: {
        type: Sequelize.DOUBLE,
      },
      PeHonorario: {
        type: Sequelize.DOUBLE,
      },
      PeMulta: {
        type: Sequelize.DOUBLE,
      },
      PeAplicaHonorario_Multa: {
        type: Sequelize.BOOLEAN,
      },
      PeAplicaHonorario_Juros: {
        type: Sequelize.BOOLEAN,
      },
      PeAplicaHonorario_Correcao: {
        type: Sequelize.BOOLEAN,
      },
      PeQuantidadeMaxParcelas: {
        type: Sequelize.INTEGER,
      },
      PeCustas: {
        type: Sequelize.DOUBLE,
      },
      PeTabelaIndicesEconomicosID: {
        type: Sequelize.INTEGER,
      },
      PeBaseCalculoJuros: {
        type: Sequelize.INTEGER,
      },
      PeQuantidadeMinParcelas: {
        type: Sequelize.INTEGER,
      },
      PeUsarJurosExterno: {
        type: Sequelize.BOOLEAN,
      },
      PeAplicaMultaValorJuros: {
        type: Sequelize.BOOLEAN,
      },
      PeCustasAcordo: {
        type: Sequelize.DOUBLE,
      },
    },
    {
      timestamps: false,
      createdAt: false,
      updatedAt: false,
      hasTrigger: true,
    }
  );

  politicas.removeAttribute("id");
  return politicas;
};
