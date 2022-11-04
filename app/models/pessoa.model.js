module.exports = (sequelize, Sequelize) => {
  const Pessoa = sequelize.define(
    "Pessoas",
    {
      Pessoas_ID: {
        type: Sequelize.INTEGER,
        field: "Pessoas_ID",
        primaryKey: true,
        autoIncrement: true,
      },
      FPesNome: {
        type: Sequelize.STRING,
      },
      FPesApelido: {
        type: Sequelize.STRING,
      },
      FPesCPF: {
        type: Sequelize.STRING,
      },
      JPesRazaoSocial: {
        type: Sequelize.STRING,
      },
      JPesNomeFantasia: {
        type: Sequelize.STRING,
      },
      JPesCNPJ: {
        type: Sequelize.STRING,
      },
      PesTipoPessoa: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      PesEndereco: {
        type: Sequelize.STRING,
      },
      PesComplementoEndereco: {
        type: Sequelize.STRING,
      },
      PesEnderecoNumero: {
        type: Sequelize.STRING,
      },
      PesBairro: {
        type: Sequelize.STRING,
      },
      PesCidade: {
        type: Sequelize.STRING,
      },
      PesEstado: {
        type: Sequelize.STRING,
      },
      PesUF: {
        type: Sequelize.STRING,
      },
      PesCEP: {
        type: Sequelize.STRING,
      },
      DataCad: {
        type: Sequelize.STRING,
        defaultValue: (normalizedDate = new Date(Date.now()).toLocaleString(
          "eu-US",
          {
            timeZone: "America/Sao_Paulo",
          }
        )),
      },
      PesPDV: {
        type: Sequelize.BOOLEAN,
      },
      PesOrigemCadastro: {
        type: Sequelize.STRING,
      },
      PesUsuarioCadastrouID: {
        type: Sequelize.STRING,
      },
      PesEstrelaQuantidadeCartelas: {
        type: Sequelize.STRING,
      },
      PesIntegracoesEstrelaUnidadesID: {
        type: Sequelize.STRING,
      },
      PesIntegracoesEstrelaSUBUnidadesID: {
        type: Sequelize.STRING,
      },
      PesEstrelaRotasID: {
        type: Sequelize.STRING,
      },
      PesIDImgApp: {
        type: Sequelize.STRING,
      },
      PesOrigensID: {
        type: Sequelize.STRING,
      },
      PesConsultorID: {
        type: Sequelize.STRING,
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

  Pessoa.removeAttribute("id");
  return Pessoa;
};

/**
 * Modelo padrão do Model, ele segue os respectivos nomes que estão na base SQL Server
 *
 * Dados importantes:
 * após o sequelize.define( vem o nome da tabela, nesse caso "Pessoas" e após isso todos os campos iguais do SQL,
 * lembrar de declarar tipo de campo, quais são nulos, a PK e se algum tem valor padrão (defaultValue)
 */
