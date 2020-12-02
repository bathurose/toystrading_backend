const Sequelize = require('sequelize');
const MySequelize = require('../utils/Sequelize');
const User = require('./User');
const Toy = require('./Toy');
const Transaction = require('./Transaction');

let Trans_Rate = MySequelize.define('trans_rate', {
    id: {
        type: Sequelize.BIGINT(20),
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    transactionid: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        references: {
            model: this.Transaction,
            key: 'id'
        }
    },
    userid: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        references: {
            model: this.User,
            key: 'id'
        }
    },
    rate: {
        type: Sequelize.FLOAT, 
        allowNull: true
    },

    createdBy: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        references: {
            model: this.User,
            key: 'id'
        }
    },
    updatedBy: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        references: {
            model: this.User,
            key: 'id'
        }
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: true
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: true
    }
}, {
    underscored: true,
    timestamps: false,
    updatedAt: false,
    createdAt: false,
    includeDeleted: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'trans_rate'
});

module.exports = Trans_Rate;