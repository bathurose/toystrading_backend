/**
 * Created by bioz on 1/13/2017.
 */
// third party components
const JsonWebToken = require('jsonwebtoken');

// our components

const ToyManager = require('../manager/ToyManager');
const Config = require('../config/Global');
const Rest = require('../utils/Restware');

module.exports = {

    //////// POST

    create: function (req, res) {
        const accessUserId = req.body.accessUserId || '';
        const accessUserType = req.body.accessUserType || '';
        const value = req.body  || '';
        const asset = req.files || ''; 
         
        ToyManager.create(accessUserId, accessUserType, value,asset, function (errorCode, errorMessage, httpCode, errorDescription, Toy) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                let resData = {};
                resData.id = Toy.id;
                return Rest.sendSuccessOne(res, resData, httpCode);
            }
        });
    },

    update: function (req, res) {
        const accessUserId = req.body.accessUserId || '';
        const accessUserType = req.body.accessUserType || '';
        const value = req.body || '';
        let id = req.params.id || '';  
        const asset = req.files || '';
        ToyManager.update(accessUserId, accessUserType, id, value,asset, function (errorCode, errorMessage, httpCode, errorDescription) {
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

        ToyManager.delete(accessUserType, id, function (errorCode, errorMessage, httpCode, errorDescription) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            }
            let resData = {};
            resData.id = id;
            return Rest.sendSuccessOne(res, resData, httpCode);
        });
    },

    getOne: function (req, res) {
        let accessUserId = req.query.accessUserId || '';
        let accessUserType = req.query.accessUserType || '';
        let id = req.params.id || '';
        if(id === 'statistic'){
            ToyManager.getStatistic(accessUserId, accessUserType, function (errorCode, errorMessage, httpCode, errorDescription, result) {
                if (errorCode) {
                    return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
                }
                return Rest.sendSuccessOne(res, result, httpCode);
            })
        }else{
            ToyManager.getOne(accessUserId, accessUserType, id, function (errorCode, errorMessage, httpCode, errorDescription, result) {
                if (errorCode) {
                    return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
                }
                return Rest.sendSuccessOne(res, result, httpCode);
            })
        }
    },
    getAnalysis: function (req, res) {
        let accessUserId = req.query.accessUserId || '';
        let accessUserType = req.query.accessUserType || '';
        ToyManager.getAnalysis(accessUserId, accessUserType, function (errorCode, errorMessage, httpCode, errorDescription, results) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                return Rest.sendSuccessOne(res, results, httpCode);
            }
        });
        
    },
    getOneAna: function (req, res) {
        let accessUserId = req.query.accessUserId || '';
        let accessUserType = req.query.accessUserType || '';
        let id = req.params.id || '';
        if(id === 'statistic'){
            ToyManager.getStatistic(accessUserId, accessUserType, function (errorCode, errorMessage, httpCode, errorDescription, result) {
                if (errorCode) {
                    return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
                }
                return Rest.sendSuccessOne(res, result, httpCode);
            })
        }
        else if(id === 'ecoin_sold'){
            ToyManager.getSumEcoinSold(accessUserId, accessUserType, function (errorCode, errorMessage, httpCode, errorDescription, result) {
                if (errorCode) {
                    return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
                }
                return Rest.sendSuccessOne(res, result, httpCode);
            })
        }
        else if(id === 'sumecoin'){
            ToyManager.getSumEcoin(accessUserId, accessUserType, function (errorCode, errorMessage, httpCode, errorDescription, result) {
                if (errorCode) {
                    return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
                }
                return Rest.sendSuccessOne(res, result, httpCode);
            })
        }
        else{
            ToyManager.getOne(accessUserId, accessUserType, id, function (errorCode, errorMessage, httpCode, errorDescription, result) {
                if (errorCode) {
                    return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
                }
                return Rest.sendSuccessOne(res, result, httpCode);
            })
        }
    },
    getToyByUser: function (req, res) {
        let accessUserId = req.query.accessUserId || '';
        let accessUserType = req.query.accessUserType || '';
        let id = req.params.id || '';
      
            ToyManager.getToyByUser(accessUserId, accessUserType, id, function (errorCode, errorMessage, httpCode, errorDescription, result) {
                if (errorCode) {
                    return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
                }
                return Rest.sendSuccessOne(res, result, httpCode);
            })
        
    },

    getAll: function (req, res) {
  
        let queryContent = req.query || '';       
        ToyManager.getAll(queryContent, function (errorCode, errorMessage, httpCode, errorDescription, results) {
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                return Rest.sendSuccessOne(res, results, httpCode);
            }
        });
    }, 
    get_new_toy: function (req, res) {      
        ToyManager.get_new_toy( function (errorCode, errorMessage, httpCode, errorDescription, result) {
       
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                return Rest.sendSuccessOne(res, result, httpCode);
            }
        });
    },   
    get_toy_byid: function (req, res) {     
        let accessUserId = req.query.accessUserId || '';
        let accessUserType = req.query.accessUserType || ''; 
        ToyManager.get_toy_byid(accessUserId, function (errorCode, errorMessage, httpCode, errorDescription, result) {
       
            if (errorCode) {
                return Rest.sendError(res, errorCode, errorMessage, httpCode, errorDescription);
            } else {
                return Rest.sendSuccessOne(res, result, httpCode);
            }
        });
    },   
};