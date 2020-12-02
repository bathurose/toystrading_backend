/**
 * Created by bioz on 1/13/2017.
 */
// third party components
const JsonWebToken = require('jsonwebtoken');

// our components

const TransactionManager = require('../manager/TransactionManager');
const Transaction = require('../models/Transaction');
const Rest = require('../utils/Restware');

module.exports = {

    //////// POST

    create: function (req, res) {
        const accessUserId = req.body.accessUserId || '';
        const accessUserType = req.body.accessUserType || '';
        const value = req.body|| '';

        TransactionManager.create(accessUserId, accessUserType, value, function (errorCode, errorMessage, httpCode, errorDescription, Transaction) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                let resData = {};
                resData.id = Transaction.id;
                return Rest.sendSuccessOne(res, resData, httpCode);
            }
        });
    },

    update: function (req, res) {
        const accessUserId = req.body.accessUserId || '';
        const accessUserType = req.body.accessUserType || '';
        let id = req.params.id || '';  
        let updateData = req.body.status || '';
        TransactionManager.update(accessUserId, accessUserType, id, updateData, function (errorCode, errorMessage, httpCode, errorDescription,results) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            }
            if (results === null)
            {
                let resData = {};
                resData.id = id;
                return Rest.sendSuccessOne(res, resData, httpCode);
            }
            else
            {
                return Rest.sendSuccessOne(res, results, httpCode);
            }
        });   
    },

    getAll: function (req, res) {
        let accessUserId = req.query.accessUserId || '';
        let accessUserType = req.query.accessUserType || '';
        let queryContent = req.query || '';

        TransactionManager.getAll(accessUserId, accessUserType, queryContent, function (errorCode, errorMessage, httpCode, errorDescription, results) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                return Rest.sendSuccessOne(res, results, httpCode);
            }
        });
        
    },
    getAllByUser: function (req, res) {
        let accessUserId = req.query.accessUserId || '';
        let accessUserType = req.query.accessUserType || '';
     

        TransactionManager.getAllByUser(accessUserId, accessUserType,function (errorCode, errorMessage, httpCode, errorDescription, results) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                return Rest.sendSuccessOne(res, results, httpCode);
            }
        });
        
    },
};