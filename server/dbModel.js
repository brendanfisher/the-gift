const Sequelize = require('sequelize');

module.exports = {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    owner: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false
    },
    createdBy: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pageTitle: {
        type: Sequelize.STRING,
        allowNull: false
    },
    updatedAt: Sequelize.DATE
};