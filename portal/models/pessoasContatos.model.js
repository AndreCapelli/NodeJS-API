module.exports = (sequelize, Sequelize) => {
    const PessoasContatos = sequelize.define(
      "PessoasContatos",
      {
        PessoasContatos_ID: {
          type: Sequelize.INTEGER,
          field: "PessoasContatos_ID",
          primaryKey: true,
          autoIncrement: true,
        },
        PesContato: {
          type: Sequelize.STRING,
        },
        PesEmail: {
          type: Sequelize.STRING,
        },
        PesDDD: {
          type: Sequelize.STRING,
        },
        PesTelefone: {
          type: Sequelize.STRING,
        },
        PesOrigemContato: {
          type: Sequelize.STRING,
        },
        PesHyperProtocolo: {
          type: Sequelize.STRING,
        },
        PesHyperLinkConversa: {
          type: Sequelize.STRING
        },
        PesPessoasID: {
            type: Sequelize.INTEGER
          },
      },
      {
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        hasTrigger: true,
      }
    );
  
    PessoasContatos.removeAttribute("id");
    return PessoasContatos;
  };
  