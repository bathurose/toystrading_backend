const Sequelize = require('sequelize');
const MySequelize = require('../utils/Sequelize');
const User = require('./User');
const Tag = require('./Tag');
const Toy = require('./Toy');

let Tag_Toy = MySequelize.define('tag_toy', {
    id: {
        type: Sequelize.BIGINT(20),
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    tag: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        references: {
            model: this.Tag,
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
    tableName: 'tag_toy'
});

module.exports = Tag_Toy;