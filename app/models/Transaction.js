const Sequelize = require('sequelize');
const MySequelize = require('../utils/Sequelize');
const User = require('./User');
const Toy = require('./Toy');

let Transaction = MySequelize.define('transaction', {
    id: {
        type: Sequelize.BIGINT(20),
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    buyer: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        references: {
            model: this.User,
            key: 'id'
        }
    },
    seller: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        references: {
            model: this.User,
            key: 'id'
        }
    },
    toyid: {
        type: Sequelize.BIGINT(20), 
        allowNull: false,
        references: {
            model: this.Toy,
            key: 'id'
        }
    },
    status: {
        type: Sequelize.ENUM('REQUEST', 'ACCEPTED', 'DONE', 'CANCEL'),
        allowNull: false,
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
    tableName: 'transaction'
});

module.exports = Transaction;