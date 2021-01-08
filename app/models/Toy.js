const Sequelize = require('sequelize');
const MySequelize = require('../utils/Sequelize');
const User = require('./User');
const Category = require('./Category');

let Toy = MySequelize.define('toy', {
    id: {
        type: Sequelize.BIGINT(20),
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    toyName: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    sex: {
        type:Sequelize.ENUM('trai', 'gai'),
        allowNull: true
    },
    age: {
        type:Sequelize.ENUM('0', '13', '46', '611', '12'),
        allowNull: true
    },
    city: {
        type:Sequelize.ENUM('HCM', 'HN', 'CT', 'HP', 'DN'),
        allowNull: true
    },
    condition: {
        type:Sequelize.ENUM('S', 'M'),
        allowNull: true
    },
    ecoin: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING(1000),
        allowNull: true,
    },
    status: {
        type: Sequelize.ENUM('READY', 'PENDING','SOLD'),
        allowNull: false,
    },
    categoryid: {
        type: Sequelize.BIGINT(20),
        allowNull: true,
        references: {
            model: this.Category,
            key: 'id'
        }
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
    tableName: 'toy'
});

module.exports = Toy;