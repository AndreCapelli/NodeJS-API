module.exports = (sequelize, Sequelize) => {
    const CampanhasPessoas = sequelize.define(
        "CampanhasPessoas",
        {
            CampanhasPessoas_ID: {
                type: Sequelize.INTEGER,
                field: "CampanhasPessoas_ID",
                primaryKey: true,
                autoIncrement: true,
            },
            CaCampanhasID: {
                type: Sequelize.INTEGER,
            },
            CaPessoasID: {
                type: Sequelize.INTEGER,
            },
            CaOperadorProprietarioID: {
                type: Sequelize.INTEGER,
            },
            CaDataUltimoContato: {
                type: Sequelize.STRING,
                defaultValue: (normalizedDate = new Date(Date.now()).toLocaleString(
                    "eu-US",
                    {
                        timeZone: "America/Sao_Paulo",
                    }
                )),
            },
        },
        {
            timestamps: false,
            createdAt: false,
            updatedAt: false,
            hasTrigger: true,
        }
    );




    CampanhasPessoas.removeAttribute("id");
    return CampanhasPessoas;
};



