const Sequelize = require('sequelize');
const MySequelize = require('../utils/Sequelize');

let User = MySequelize.define('user', {
    id: {
        type: Sequelize.BIGINT(20),
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    userName: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    password: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    phone: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    ecoin: {
        type: Sequelize.BIGINT(20),
        allowNull: true,
    },
    rate: {
        type: Sequelize.FLOAT,
        allowNull: true,
    },
    type: {
        type: Sequelize.TINYINT(1),
        allowNull: true,
        default: 1
    },
    isVerifyEmail: {
        type: Sequelize.TINYINT(1),
        allowNull: true,
        default: 0
    },
    activated: {
        type: Sequelize.TINYINT(1),
        allowNull: true,
        default: 1
    },
    createdBy: {
        type: Sequelize.BIGINT(20),
        allowNull: true,
        // references: {
        //     model: this.User,
        //     key: 'id'
        // }
    },
    updatedBy: {
        type: Sequelize.BIGINT(20),
        allowNull: true,
        // references: {
        //     model: this.User,
        //     key: 'id'
        
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
    tableName: 'user'
});

module.exports = User;