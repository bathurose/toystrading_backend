const Config = require('../config/Database');
const Sequelize = require('sequelize');
const dbIndex = 0;

const MySQLSequelize = new Sequelize(
    Config[dbIndex].database,
    Config[dbIndex].username,
    Config[dbIndex].password, {
        host: Config[dbIndex].host,
        port: Config[dbIndex].port,
        dialect: Config[dbIndex].dialect,
        dialectOptions: {
            connectTimeout: 30000
          },
          pool: {
            max: 50,
            min: 0,
            acquire: 1200000,
            idle: 1000000,
          },
        logging: false,
        operatorsAliases: false,

        
    }
);
MySQLSequelize
        .authenticate()
        .then(() => {
            console.log('Connection has been established successfully.');
        })
        .catch((err) => {
            console.log('Unable to connect to the database:', err);
        });

module.exports = MySQLSequelize;