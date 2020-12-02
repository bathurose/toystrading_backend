/**
 * Created by bioz on 1/13/2017.
 */
// third party components
const JsonWebToken = require('jsonwebtoken');

// our components
const AssetManager = require('../manager/AssetManager');
const Asset = require('../models/Asset');
const Rest = require('../utils/Restware');

module.exports = {

    //////// POST

    create: function (req, res) {
        const accessUserId = req.body.accessUserId || '';
        const accessUserType = req.body.accessUserType || '';
        const value = req.files || '';


        //const value = req.file || '';
        AssetManager.create(accessUserId, accessUserType, value, function (errorCode, errorMessage, httpCode, errorDescription, asset) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                let resData = {};
                resData.id = asset;
                return Rest.sendSuccessOne(res, asset, httpCode);
            }
        });
    },

    del: function (req, res) {
        const accessUserId = req.body.accessUserId || '';
        const accessUserType = req.body.accessUserType || '';
        const value = req.body.url || '';
       

        //const value = req.file || '';
        AssetManager.del(accessUserId, accessUserType, value, function (errorCode, errorMessage, httpCode, errorDescription, asset) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                let resData = {};
                resData.id = asset;
                return Rest.sendSuccessOne(res, asset, httpCode);
            }
        });
    },
    // //////// DELETE

    delete: function (req, res) {
        let accessUserType = req.body.accessUserType || '';
        let id = req.params.id || '';
        AssetManager.delete(accessUserType, id, function (errorCode, errorMessage, httpCode, errorDescription) {
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
        let id = req.params.id || '';
        AssetManager.getAll(accessUserId, accessUserType, id, function (errorCode, errorMessage, httpCode, errorDescription, results) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                return Rest.sendSuccessOne(res, results, httpCode);
            }
        });
    },  

    // getAll: function (req, res) {
    //     let accessUserId = req.query.accessUserId || '';
    //     let accessUserType = req.query.accessUserType || '';
    //     let queryContent = req.query || '';

    //     CategoryManager.getAll(accessUserId, accessUserType, queryContent, function (errorCode, errorMessage, httpCode, errorDescription, results) {
    //         if (errorCode) {
    //             return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
    //         } else {
    //             return Rest.sendSuccessOne(res, results, httpCode);
    //         }
    //     });
    // },  
};