/**
 * Created by bioz on 1/13/2017.
 */
// third party components
const JsonWebToken = require('jsonwebtoken');

// our components
const Config = require('../config/Global');
const UserManager = require('../manager/UserManager.js');
const Rest = require('../utils/Restware');
// param thi co tren link, body k co 
module.exports = {
    create: function (req, res) {
        let Data = req.body || '';
        UserManager.create(  Data, function (errorCode, errorMessage, httpCode, errorDescription, user) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                let resData = {};
                resData.id = user.id;
                return Rest.sendSuccessOne(res, resData, httpCode);
            }
        })
    },

    signUP: function (req, res) {
        let accessUserId = req.query.accessUserId || '';
        let accessUserType = req.query.accessUserType || '';
        let id = req.params.id  || '';
        UserManager.signUP(accessUserId, accessUserType,id, function (errorCode, errorMessage, httpCode, errorDescription, result) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            }
            return Rest.sendSuccessOne(res, result, httpCode);
        })
        
        
    },

    getOne: function (req, res) {
        let accessUserId = req.query.accessUserId || '';
        let accessUserType = req.query.accessUserType || '';
        let id = req.params.id || '';
        if(id === 'statistic'){
            UserManager.getStatistic(accessUserId, accessUserType, function (errorCode, errorMessage, httpCode, errorDescription, result) {
                if (errorCode) {
                    return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
                }
                return Rest.sendSuccessOne(res, result, httpCode);
            })
        }else{
            UserManager.getOne(accessUserId, accessUserType, id, function (errorCode, errorMessage, httpCode, errorDescription, result) {
                if (errorCode) {
                    return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
                }
                return Rest.sendSuccessOne(res, result, httpCode);
            })
        }
    },

    getAll: function (req, res) {
        let accessUserId = req.query.accessUserId || '';
        let accessUserType = req.query.accessUserType || '';
        let query = req.query || '';

        UserManager.getAll(accessUserId, accessUserType, query, function (errorCode, errorMessage, httpCode, errorDescription, results) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            }
            return Rest.sendSuccessMany(res, results, httpCode);
        });
    },

    update: function (req, res) {
        let accessUserId = req.body.accessUserId || '';
        let accessUserType = req.body.accessUserType || '';

        let id = req.params.id || '';

        if( id === 'deletes' ){
            let ids = req.body.ids || '';
            UserManager.deletes(accessUserId, accessUserType, ids, function (errorCode, errorMessage, httpCode, errorDescription) {
                if (errorCode) {
                    return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
                }
                return Rest.sendSuccessOne(res, null, httpCode);
            });
        }else {
            let data = req.body || '';
            UserManager.update( accessUserId, accessUserType, id, data, function (errorCode, errorMessage, httpCode, errorDescription, result) {
                if (errorCode) {
                    return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
                } else {
                let resData = {};
                resData.id = result;
                return Rest.sendSuccessOne(res, resData, httpCode);
            }
            });
        }
    },
    updatePW: function (req, res) {
        let accessUserId = req.body.accessUserId || '';
        let accessUserType = req.body.accessUserType || '';
        let id = req.params.id || '';       
        let data = req.body || '';
        UserManager.updatePW( accessUserId, accessUserType, id, data, function (errorCode, errorMessage, httpCode, errorDescription, result) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
            let resData = {};
            resData.id = result;
            return Rest.sendSuccessOne(res, resData, httpCode);
        }
        });
    
    },



    deletes: function (req, res) {
        let accessUserType = req.body.accessUserType || '';

        let ids = req.body.ids || '';
            UserManager.deletes(accessUserType, ids, function (errorCode, errorMessage, httpCode, errorDescription) {
                if (errorCode) {
                    return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
                }
                return Rest.sendSuccessOne(res, null, httpCode);
            });
    },

    delete: function (req, res) {
        let accessUserType = req.body.accessUserType || '';
        let id = req.params.id || '';
        console.log(id);
        UserManager.delete(accessUserType, id, function (errorCode, errorMessage, httpCode, errorDescription) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
            let resData = {};
            resData.id = id;
            return Rest.sendSuccessOne(res, resData, httpCode);
        }
        });
    },

    login: function (req, res) {
        let userName = req.body.userName || '';
        let password = req.body.password || '';

        UserManager.authenticate(userName, password, function (errorCode, errorMessage, httpCode, errorDescription, result) {
            if ( errorCode ) {
                return Rest.sendError( res, errorCode, errorMessage, httpCode, errorDescription );
            }
            JsonWebToken.sign({ id: result.id, userName: result.userName,  email: result.email, type: result.type }, Config.jwtAuthKey, { expiresIn: '25 days' }, function(error, token) {
                if( error )
                {
                    return Rest.sendError( res, 4000, 'create_token_fail', 400, error );
                }else{
                    return Rest.sendSuccessToken(res, token, result);
                }
            });
        });
    }
};
