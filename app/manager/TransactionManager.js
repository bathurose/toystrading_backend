/**
 * Created by bioz on 1/13/2017.
 */
// third party components
const BCrypt = require('bcryptjs');
const Validator = require('validator');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const cron = require('node-cron');

// our components
const Constant = require('../utils/Constant');
const Pieces = require('../utils/Pieces');
const Models = require('../models');
const { where } = require('sequelize');
const Transaction = Models.Transaction;
const Toy = Models.Toy;
const User = Models.User;
const Asset = Models.Asset;


module.exports = {
    create : function (accessUserId,accessUserType, transData, callback) {
        try {
                      
            Transaction.count({
                where:{
                    buyer:accessUserId,
                    [Op.or]: [{ status: "REQUEST" }, { status: "ACCEPTED" }], 
                },
            }).then(total=>{ 
                "use strict";
                if (total > 0 )
                {
                    return callback(1, 'You have already had a transaction', 400, null, null);
                }            
                else
                {
                    Toy.findOne({
                        where:{id:transData.toyid},
                    }).then(function(ecoin_toy){ 
                        "use strict";
                        User.findOne({
                            where:{id:accessUserId},
                        }).then(function(ecoin_user){ 
                            "use strict";
                            if (ecoin_toy.dataValues.ecoin > ecoin_user.dataValues.ecoin ){
                                return callback(1, 'You do not have enough ecoin',400 ,null, null);
                            }    
                            else
                            {                               
                            Toy.update(
                                {
                                    status : 'PENDING',
                                    updatedAt : new Date()
                                },
                                {
                                    where:{id:transData.toyid}
                                }
                            ).catch(function(error){
                                "use strict";
                                return callback(1, 'update toy fail', 400, error, null);
                            }); 
                            }      
                            let queryObj = {};
                            queryObj.seller = ecoin_toy.dataValues.createdBy;
                            queryObj.buyer = accessUserId;
                            queryObj.toyid = transData.toyid;
                            queryObj.status='REQUEST';
                            queryObj.createdBy = accessUserId;
                            queryObj.updatedBy = accessUserId;
                            Transaction.create(queryObj).then(result=>{
                                "use strict";
                                return callback(null, null, 200, null, result);
                            }).catch(function(error){
                                "use strict";
                                return callback(1, 'create_transaction_fail', 400, error, null);
                            });         
                        }).catch(function(error){
                            "use strict";
                            return callback(1, 'find user fail', 400, error, null);
                        });             
                    }).catch(function(error){
                        "use strict";
                        return callback(1, 'find toy fail', 400, error, null);
                    });
                }   
            }).catch(function(error){
                "use strict";
                return callback(1, 'count_transaction_fail', 400, error, null);
            });
   
            //compare ecoin
            // Toy.findOne({
            //     where:{id:transData.toyid},
            // }).then(function(ecoin_toy){ 
            //     "use strict";
            //     User.findOne({
            //         where:{id:accessUserId},
            //     }).then(function(ecoin_user){ 
            //         "use strict";
            //         if (ecoin_toy.dataValues.ecoin > ecoin_user.dataValues.ecoin ){
            //             return callback(1, 'You do not have enough ecoin',400 ,null, null);
            //         }               
            //     }).catch(function(error){
            //         "use strict";
            //         return callback(1, 'find user fail', 400, error, null);
            //     });             
            // }).catch(function(error){
            //     "use strict";
            //     return callback(1, 'find toy fail', 400, error, null);
            // });
 
            
            // Toy.update(
            //     {
            //         status : 'PENDING',
            //         updatedAt : new Date()
            //     },
            //     {
            //         where:{id:transData.toyid}
            //     }
            // ).catch(function(error){
            //     "use strict";
            //     return callback(1, 'update toy fail', 400, error, null);
            // }); 

            
      
            // Toy.findOne({
            //     where:{id:transData.toyid},
            // }).then(function(toy){ 
            //     "use strict";         
            //     let queryObj = {};
            //     queryObj.seller = toy.dataValues.createdBy;
            //     queryObj.buyer = accessUserId;
            //     queryObj.toyid = transData.toyid;
            //     queryObj.status='REQUEST';
            //     queryObj.createdBy = accessUserId;
            //     queryObj.updatedBy = accessUserId;
            //     Transaction.create(queryObj).then(result=>{
            //         "use strict";
            //         return callback(null, null, 200, null, result);
            //     }).catch(function(error){
            //         "use strict";
            //         return callback(1, 'create_transaction_fail', 400, error, null);
            //     });               
            // }).catch(function(error){
            //     "use strict";
            //     return callback(1, 'find toy fail', 400, error, null);
            // });

           
        }catch(error){
            return callback(2, 'create_transaction_fail', 400, error, null);
        }
    },

    getAll: async function(accessUserId, accessUserType, query, callback){
        try {
            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'invalid_user_type', 400, null, null);
            }
            let where={};
            let page = 1;
            let perPage = Constant.DEFAULT_PAGING_SIZE
            let sort = [];
            this.parseFilter(accessUserId, accessUserType, where, query.filter);
            
            if( Pieces.VariableBaseTypeChecking(query.status, 'string') ){
                where.status = query.status
            }
            if( (Pieces.VariableBaseTypeChecking(query['page'], 'string') && Validator.isInt(query['page']))
                || (Pieces.VariableBaseTypeChecking(query['page'], 'number')) ){
                page = parseInt(query['page']);
                if(page === 0){
                    page = 1;
                }
            }

            if( (Pieces.VariableBaseTypeChecking(query['perPage'], 'string') && Validator.isInt(query['perPage']))
                || (Pieces.VariableBaseTypeChecking(query['perPage'], 'number')) ){
                perPage = parseInt(query['perPage']);
                if(perPage <= 0){
                    perPage = Constant.DEFAULT_PAGING_SIZE;
                }
            }

            Pieces.splitAndAssignValueForSort(sort, query['sort']);
            if(sort.length <= 0){
                sort.push(['updatedAt', 'DESC']);
            }
            if (query.to != null && query.from !=null )
            {
                var to = new Date(query.to);
                var from = new Date(query.from);
                where.createdAt= {[Op.lt]: to,[Op.gt]: from};
            }
            Toy.hasMany(Transaction, {      
                foreignKey: {
                  name: 'toyid',     
                }              
              });
            Transaction.belongsTo(Toy, {             
                foreignKey: {
                  name: 'toyid',
                }              
              });
            User.hasMany(Toy, {              
                foreignKey: 'createdBy',                            
              });
            Toy.belongsTo(User, { foreignKey: 'createdBy' });       
            User.hasMany(Transaction, {                  
                foreignKey: 
                  'buyer',                          
              });
    
            Transaction.belongsTo(User,{
                foreignKey: 'buyer',        
              });               
            let offset = perPage * (page - 1);
                            
            await Transaction.findAndCountAll({              
                include:[{           
                        model: User,                                                                          
                    },{
                    model: Toy,
                    include:[
                        {
                            model :User,
                        }
                    ]
                    }] ,                 
                    where: where,
                    limit: perPage,
                    offset: offset,
                    order: sort,
                    required: true 
                })
                .then((data) => {
                    let pages = Math.ceil(data.count / perPage);
                    let accounts = data.rows;
                    let output = {
                        data: accounts,
                        pages: {
                            current: page,
                            prev: page - 1,
                            hasPrev: false,
                            next: (page + 1) > pages ? 0 : (page + 1),
                            hasNext: false,
                            total: pages
                        },
                        items: {
                            begin: ((page * perPage) - perPage) + 1,
                            end: page * perPage,
                            total: data.count
                        }
                    };
                    output.pages.hasNext = (output.pages.next !== 0);
                    output.pages.hasPrev = (output.pages.prev !== 0);
                    return callback(null, null, 200, null, output);
                }).catch(function (error) {
                    return callback(1, 'find_and_count_all_tag_fail', 420, error, null);
                });
        }catch(error){
            return callback(2, 'get_all_tag_fail', 400, error, null);
        }
    },

    update: function (accessUserId, accessUserType,transid, updateData, callback) {
        try {
            let queryObj = {};
            let where = {};
            if ( !( Pieces.VariableBaseTypeChecking(transid,'string')
                    && Validator.isInt(transid) )
                && !Pieces.VariableBaseTypeChecking(transid,'number') ){
                return callback(1, 'invalid_transaction_id', 400, 'transaction id is incorrect', null);
            }
            queryObj.updatedBy = accessUserId; //set
            where.id = transid; //where 
            queryObj.updatedAt = new Date();
            if ( Pieces.VariableBaseTypeChecking(updateData, 'string'))
            {                   
                queryObj.status = updateData;
            }           
            Transaction.update(
                queryObj,
                {where: where}).then(result=>{
                    "use strict"                    
            }).catch(function(error){
                "use strict";
                return callback(2, 'update_transaction_fail', 400, error, null);
            });
          
            if (updateData === 'ACCEPTED')
            {
                Transaction.findOne(
                    {
                        where: where,
                    }).then(result=>{
                        "use strict"  
                        console.log(result)
                        if (accessUserId === result.dataValues.seller)
                        {
                            Toy.hasMany(Transaction, {
                                foreignKey: "toyid",               
                              });
                            Transaction.belongsTo(Toy, {
                                foreignKey: "toyid",              
                              });
                            User.hasMany(Transaction, {
                                foreignKey: "buyer",               
                              });
                            Transaction.belongsTo(User, {
                                foreignKey: "buyer",              
                              });
                            Transaction.findAll(
                                {
                                    where: where,
                                    include: [{                     
                                        model: Toy,                                                          
                                      },
                                      {
                                        model: User,                   
                                      }],
                                }).then(result=>{
                                    "use strict"         
                                    return callback(null, null, 200, null, result);        
                            }).catch(function(error){
                                return callback(1, 'getAll_transaction_fail', 400, error, null);
                            });      
                        }   
                        else
                        {
                            Toy.hasMany(Transaction, {
                                foreignKey: "toyid",               
                              });
                            Transaction.belongsTo(Toy, {
                                foreignKey: "toyid",              
                              });
                            User.hasMany(Transaction, {
                                foreignKey: "seller",               
                              });
                            Transaction.belongsTo(User, {
                                foreignKey: "seller",              
                              });
                            Transaction.findAll(
                                {
                                    where: where,
                                    include: [{                     
                                        model: Toy,                                                          
                                      },
                                      {
                                        model: User,                   
                                      }],
                                }).then(result=>{
                                    "use strict"         
                                    return callback(null, null, 200, null, result);        
                            }).catch(function(error){
                                return callback(1, 'getAll_transaction_fail', 400, error, null);
                            });      
                        }                    
                }).catch(function(error){
                    return callback(1, 'getAll_transaction_fail', 400, error, null);
                });
            }
            
            if( updateData === 'DONE')
            {
                Transaction.findOne(
                    {where: where}).then(result=>{
                        "use strict"  
                        Toy.findOne(
                            {
                                where: {id:result.dataValues.toyid}
                            }
                            ).then(toy=>{  
                                "use strict"; 
                                User.findOne(
                                    {
                                        where: {id:result.dataValues.buyer}
                                    }
                                    ).then(buyer=>{  
                                        "use strict";       
                                    User.update(
                                        {
                                            ecoin:buyer.dataValues.ecoin-toy.dataValues.ecoin,
                                            updatedAt : new Date()
                                        },
                                            {where: 
                                                {
                                                    id:result.dataValues.buyer,
                                                    
                                                }
                                        }
                                        ).then(data=>{  
                                            "use strict";                          
                                        }).catch(function(error){
                                            "use strict";
                                            return callback(2, 'update_user_fail', 400, error, null);
                                        });  
                                    }).catch(function(error){
                                            "use strict";
                                            return callback(2, 'find_user_fail', 400, error, null);
                                    });  
                                User.findOne(
                                    {
                                        where: {id:result.dataValues.seller}
                                    }
                                    ).then(seller=>{  
                                        "use strict";       
                                    User.update(
                                        {
                                            ecoin:seller.dataValues.ecoin+toy.dataValues.ecoin,
                                            updatedAt : new Date()
                                        },
                                            {where: 
                                                {
                                                    id:result.dataValues.seller,
                                                  
                                                }
                                        }
                                        ).then(data=>{  
                                            "use strict";                          
                                        }).catch(function(error){
                                            "use strict";
                                            return callback(2, 'update_user_fail', 400, error, null);
                                        });                     
                                    }).catch(function(error){
                                        "use strict";
                                        return callback(2, 'find_user_fail', 400, error, null);
                                    });                    
                        }).catch(function(error){
                            "use strict";
                            return callback(2, 'find_toy_fail', 400, error, null);
                        }); 
                    Toy.update(
                        {
                            status : 'SOLD',
                            updatedAt : new Date()
                        },
                        {
                            where: {id:result.dataValues.toyid}
                        }
                        ).then(toy=>{  
                            "use strict";  
                        return callback(null, null, 200, null, null);                                  
                        }).catch(function(error){
                            "use strict";
                            return callback(2, 'delete_toy_fail', 400, error, null);
                    });                       
                }).catch(function(error){
                    "use strict";
                    return callback(1, 'update_transaction_fail', 400, error, null);
                });
            }    
            if( updateData === 'CANCEL')
            {
                Transaction.findOne(
                    {where: where}).then(result=>{
                     Toy.update(
                    {
                        status:'READY',
                        updatedAt : new Date()
                    },
                    { 
                        where: 
                        {                     
                            id:result.dataValues.toyid                         
                        }
                    }
                    ).then(toy=>{  
                        "use strict";    
                        return callback(null, null, 200, null, null);                      
                    }).catch(function(error){
                        "use strict";
                        return callback(2, 'update_toy_fail', 400, error, null);
                    }); 
                }).catch(function(error){
                    "use strict";
                    return callback(1, 'find_transaction_fail', 400, error, null);
                })
            }                  
        }catch(error){
            return callback(2, 'update_transaction_fail', 400, error, null);
        }
    },

    getAllByUser: function(accessUserId, accessUserType, callback){
        try {
            let where={};
            where.seller=accessUserId;
            where.status='REQUEST';
            Toy.hasMany(Transaction, {
                foreignKey: "toyid",               
              });
            Transaction.belongsTo(Toy, {
                foreignKey: "toyid",              
              });
            User.hasMany(Transaction, {
                foreignKey: "buyer",               
              });
            Transaction.belongsTo(User, {
                foreignKey: "buyer",              
              });
            Transaction.findOne({
                    where: where,
                    include: [{                     
                        model: Toy,                                                          
                      },
                      {
                        model: User,                   
                      }],
                })
                .then((data) => {
                    return callback(null, null, 200, null, data);
                }).catch(function (error) {
                    return callback(1, 'get_transaction_fail', 420, error, null);
                });
        }catch(error){
            return callback(2, 'get_transaction_fail', 400, error, null);
        }
    },

    getAllBuy: function(accessUserId, accessUserType, callback){
        try {
            let where={};
            where.buyer=accessUserId;
            
            Toy.hasMany(Asset, {
                foreignKey: "toyid",               
              });
            Asset.belongsTo(Toy, {
                foreignKey: "toyid",              
              });
            Toy.hasMany(Transaction, {
                foreignKey: "toyid",               
              });
            Transaction.belongsTo(Toy, {
                foreignKey: "toyid",              
              });
            User.hasMany(Transaction, {
                foreignKey: "seller",               
              });
            Transaction.belongsTo(User, {
                foreignKey: "seller",              
              });
            Transaction.findAll({
                    where: where,
                    include: [{                     
                        model: Toy,   
                        include: [
                          {
                            model: Asset,                   
                          }],                                                       
                      },
                      {
                        model: User,                   
                      }],
                })
                .then((data) => {
                    return callback(null, null, 200, null, data);
                }).catch(function (error) {
                    return callback(1, 'get_transaction_fail', 420, error, null);
                });
        }catch(error){
            return callback(2, 'get_transaction_fail', 400, error, null);
        }
    },

    getAllSell: function(accessUserId, accessUserType, callback){
        try {
            let where={};
            where.seller=accessUserId;
            Toy.hasMany(Asset, {
                foreignKey: "toyid",               
              });
            Asset.belongsTo(Toy, {
                foreignKey: "toyid",              
              });
            Toy.hasMany(Transaction, {
                foreignKey: "toyid",               
              });
            Transaction.belongsTo(Toy, {
                foreignKey: "toyid",              
              });
            User.hasMany(Transaction, {
                foreignKey: "buyer",               
              });
            Transaction.belongsTo(User, {
                foreignKey: "buyer",              
              });
            Transaction.findAll({
                    where: where,
                    include: [{                     
                        model: Toy,   
                        include: [
                          {
                            model: Asset,                   
                          }],                                                       
                      },
                      {
                        model: User,                   
                      }],
                })
                .then((data) => {
                    return callback(null, null, 200, null, data);
                }).catch(function (error) {
                    return callback(1, 'get_transaction_fail', 420, error, null);
                });
        }catch(error){
            return callback(2, 'get_transaction_fail', 400, error, null);
        }
    },


   
    // // --------- others ----------
    parseFilter: function(accessUserId, accessUserType, condition, filters) {
        try {
            if ( !Pieces.VariableBaseTypeChecking(filters,'string')
                || !Validator.isJSON(filters) ) {
                return false;
            }

            let aDataFilter = Pieces.safelyParseJSON1(filters);
            if( aDataFilter && (aDataFilter.length > 0) ){
                for(let i = 0; i < aDataFilter.length; i++ ){
                    if ( !Pieces.VariableBaseTypeChecking(aDataFilter[i].key, 'string')
                        || !Pieces.VariableBaseTypeChecking(aDataFilter[i].operator, 'string')
                        || aDataFilter[i].value === null
                        || aDataFilter[i].value === undefined ){
                        continue;
                    }

                    if ( aDataFilter[i].key === 'activated'
                        && ( (aDataFilter[i].operator === '=') || (aDataFilter[i].operator === '!=') )
                        && (aDataFilter[i].value === Constant.ACTIVATED.YES || aDataFilter[i].value === Constant.ACTIVATED.NO) ) {
                        switch(aDataFilter[i].operator){
                            case '=':
                                condition[aDataFilter[i].key] = aDataFilter[i].value;
                                break;
                            case '!=':
                                condition[aDataFilter[i].key] = {$ne: aDataFilter[i].value};
                                break;
                        }
                        continue;
                    }

                    if ( aDataFilter[i].key === 'type'
                        && ( (aDataFilter[i].operator === '=') || (aDataFilter[i].operator === '!=') )
                        && Pieces.ValidObjectEnum(aDataFilter[i].value, Constant.USER_TYPE) ) {
                        switch(aDataFilter[i].operator){
                            case '=':
                                condition[aDataFilter[i].key] = aDataFilter[i].value;
                                break;
                            case '!=':
                                condition[aDataFilter[i].key] = {$ne: aDataFilter[i].value};
                                break;
                        }
                        continue;
                    }

                    if ( (aDataFilter[i].key === 'createdAt') &&
                            (
                                (aDataFilter[i].operator === '=')
                                || (aDataFilter[i].operator === '!=')
                                || (aDataFilter[i].operator === '<')
                                || (aDataFilter[i].operator === '>')
                                || (aDataFilter[i].operator === '<=')
                                || (aDataFilter[i].operator === '>=')
                                || (aDataFilter[i].operator === 'in')
                            )
                    ) {
                        if( aDataFilter[i].operator !== 'in'
                            && Pieces.VariableBaseTypeChecking(aDataFilter[i].value, 'string')
                            && Validator.isISO8601(aDataFilter[i].value) ){
                            switch(aDataFilter[i].operator){
                                case '=':
                                    condition[aDataFilter[i].key] = {$eq: aDataFilter[i].value};
                                    break;
                                case '!=':
                                    condition[aDataFilter[i].key] = {$ne: aDataFilter[i].value};
                                    break;
                                case '>':
                                    condition[aDataFilter[i].key] = {$gt: aDataFilter[i].value};
                                    break;
                                case '>=':
                                    condition[aDataFilter[i].key] = {$gte: aDataFilter[i].value};
                                    break;
                                case '<':
                                    condition[aDataFilter[i].key] = {$lt: aDataFilter[i].value};
                                    break;
                                case '<=':
                                    condition[aDataFilter[i].key] = {$lte: aDataFilter[i].value};
                                    break;
                            }
                        }else if(aDataFilter[i].operator === 'in'){
                            if(aDataFilter[i].value.length === 2
                                && Pieces.VariableBaseTypeChecking(aDataFilter[i].value[0], 'string')
                                && Pieces.VariableBaseTypeChecking(aDataFilter[i].value[1], 'string')
                                && Validator.isISO8601(aDataFilter[i].value[0])
                                && Validator.isISO8601(aDataFilter[i].value[1]) ){
                                condition[aDataFilter[i].key] = { $gte: aDataFilter[i].value[0], $lte: aDataFilter[i].value[1] };
                            }
                        }
                        continue;
                    }

                    if ( (aDataFilter[i].key === 'updatedAt') &&
                            (
                                    (aDataFilter[i].operator === '=')
                                    || (aDataFilter[i].operator === '!=')
                                    || (aDataFilter[i].operator === '<')
                                    || (aDataFilter[i].operator === '>')
                                    || (aDataFilter[i].operator === '<=')
                                    || (aDataFilter[i].operator === '>=')
                                    || (aDataFilter[i].operator === 'in')
                            )
                    ) {
                        if( aDataFilter[i].operator !== 'in'
                            && Pieces.VariableBaseTypeChecking(aDataFilter[i].value, 'string')
                            && Validator.isISO8601(aDataFilter[i].value) ){
                            switch(aDataFilter[i].operator){
                                case '=':
                                    condition[aDataFilter[i].key] = {$eq: aDataFilter[i].value};
                                    break;
                                case '!=':
                                    condition[aDataFilter[i].key] = {$ne: aDataFilter[i].value};
                                    break;
                                case '>':
                                    condition[aDataFilter[i].key] = {$gt: aDataFilter[i].value};
                                    break;
                                case '>=':
                                    condition[aDataFilter[i].key] = {$gte: aDataFilter[i].value};
                                    break;
                                case '<':
                                    condition[aDataFilter[i].key] = {$lt: aDataFilter[i].value};
                                    break;
                                case '<=':
                                    condition[aDataFilter[i].key] = {$lte: aDataFilter[i].value};
                                    break;
                            }
                        }else if(aDataFilter[i].operator === 'in'){
                            if(aDataFilter[i].value.length === 2
                                && Pieces.VariableBaseTypeChecking(aDataFilter[i].value[0], 'string')
                                && Pieces.VariableBaseTypeChecking(aDataFilter[i].value[1], 'string')
                                && Validator.isISO8601(aDataFilter[i].value[0])
                                && Validator.isISO8601(aDataFilter[i].value[1]) ){
                                condition[aDataFilter[i].key] = { $gte: aDataFilter[i].value[0], $lte: aDataFilter[i].value[1] };
                            }
                        }
                    }
                }
            }else{
                return false;
            }
        }catch (error){
            return false;
        }
    }
};
