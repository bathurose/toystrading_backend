/**
 * Created by bioz on 1/13/2017.
 */
// third party components
const JsonWebToken = require('jsonwebtoken');

// our components

const CategoryManager = require('../manager/CategoryManager');
const Category = require('../models/Category');
const Rest = require('../utils/Restware');

module.exports = {

    //////// POST

    create: function (req, res) {
        const accessUserId = req.body.accessUserId || '';
        const accessUserType = req.body.accessUserType || '';
        const value = req.body || '';
       
        CategoryManager.create(accessUserId, accessUserType, value, function (errorCode, errorMessage, httpCode, errorDescription, category) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                let resData = {};
                resData.id = category.id;
                return Rest.sendSuccessOne(res, resData, httpCode);
            }
        });
    },

    update: function (req, res) {
        const accessUserId = req.body.accessUserId || '';
        const accessUserType = req.body.accessUserType || '';
        let id = req.params.id || '';  
        let updateData = req.body || '';
        CategoryManager.update(accessUserId, accessUserType, id, updateData, function (errorCode, errorMessage, httpCode, errorDescription) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            }
            let resData = {};
            resData.id = id;
            return Rest.sendSuccessOne(res, resData, httpCode);
        });   
    },

    //////// DELETE

    delete: function (req, res) {
        let accessUserType = req.body.accessUserType || '';
        let id = req.params.id || '';

        CategoryManager.delete(accessUserType, id, function (errorCode, errorMessage, httpCode, errorDescription) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            }
            let resData = {};
            resData.id = id;
            return Rest.sendSuccessOne(res, resData, httpCode);
        });
    },

    getAll: function (req, res) {
        let accessUserId = req.query.accessUserId || '';
        let accessUserType = req.query.accessUserType || '';
        let queryContent = req.query || '';

        CategoryManager.getAll(accessUserId, accessUserType, queryContent, function (errorCode, errorMessage, httpCode, errorDescription, results) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                return Rest.sendSuccessOne(res, results, httpCode);
            }
        });
    },  

    getAllCB: function (req, res) {
        let accessUserId = req.query.accessUserId || '';
        let accessUserType = req.query.accessUserType || '';

        CategoryManager.getAllCB(accessUserId, accessUserType, function (errorCode, errorMessage, httpCode, errorDescription, results) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                return Rest.sendSuccessOne(res, results, httpCode);
            }
        });
    },  
};