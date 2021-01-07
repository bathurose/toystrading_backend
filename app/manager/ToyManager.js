/**
 * Created by bioz on 1/13/2017.
 */
// third party components
const BCrypt = require('bcryptjs');
const Validator = require('validator');
const Sequelize = require('sequelize');


// our components
const Constant = require('../utils/Constant');
const Pieces = require('../utils/Pieces');
const Models = require('../models');
const { INTEGER, NUMBER, and } = require('sequelize');
const Asset = Models.Asset;
const Toy = Models.Toy;
const Category = Models.Category;
const Tag = Models.Tag;
const Tag_Toy = Models.Tag_Toy;
const User = Models.User;
const fs = require("fs");
const Cloudinary = require('../middlewares/Cloudinary');
const { ok } = require('assert');

module.exports = {
    create : function (accessUserId,accessUserType ,toyData , assetData, callback) {
       
        try {
       
            let temp = parseInt(toyData.ecoin);
            // if (assetData==undefined)
            // {
            // return callback(1, 'You must select file', 400, null, null);
            // } 
            if ( !Pieces.VariableBaseTypeChecking(toyData.toyName, 'string')
            || !Validator.isLength(toyData.toyName, {min: 5, max: 128}) ) {
                return callback(1, 'invalid_toy_name', 400, 'length 4-128', null);
            }
            if (!Pieces.VariableBaseTypeChecking(temp,'number'))
            {
                return callback(1, 'invalid_ecoin', 400, 'ecoin is not type int', null);
            }
            if (toyData.ecoin > 200000 )
            {
                return callback(1, 'invalid_ecoin', 400, 'ecoin is less than 200000', null);
            }
         
            let asssetObj = [];     
            // assetData.forEach((val) => {
            //     asssetObj.push([val.mimetype,val.originalname,val.filename,accessUserId]);              
            // });                 
               
            assetData.forEach((value) => {
                asssetObj.push(value.path);   
                          
            });
            //Asset
            let queryObj = {};
            let tagObj = {};
            queryObj.toyName= toyData.toyName;
            queryObj.sex = toyData.sex;
            queryObj.age = toyData.age;
            queryObj.city = toyData.city;
            queryObj.condition = toyData.condition;
            queryObj.ecoin = toyData.ecoin;
            queryObj.description = toyData.description;
            queryObj.status = "READY";
            queryObj.category = toyData.category;
    
            queryObj.createdBy = accessUserId;
            queryObj.updatedBy = accessUserId;   
               //Asset
         
            let arrTag = JSON.parse( JSON.stringify(toyData.tag));
       
            Toy.create(queryObj).then(result=>{
                "use strict";                             
                for (let i =0 ;i<arrTag.length;i++)
                {
                    tagObj.tag=arrTag[i].id;
                    tagObj.toyid=result.dataValues.id;
                    tagObj.createdBy = accessUserId;
                    tagObj.updatedBy = accessUserId;  
                    Tag_Toy.create(tagObj).then(tagtoy=>{  
                        "use strict";                          
                    }).catch(function(error){
                        "use strict";
                        return callback(2, 'create_asset_fail', 400, error, null);
                    });  
                }

                Cloudinary.uploadMutiple(asssetObj,resultAsset => {
                    const convertedData = resultAsset.map(arrObj => {
                        return{
                            toyid : result.dataValues.id,
                            url : arrObj,   
                            createdBy : accessUserId,
                            updatedBy : accessUserId  
                        }
                    })            
                    Asset.bulkCreate(convertedData).then(asset=>{  
                        "use strict";            
                         return callback(null, null, 200, null, result);
                    }).catch(function(error){
                        "use strict";
                        return callback(2, 'create_asset_fail', 402, error, null);
                    });    
                })  
                                      
            }).catch(function(error){
                "use strict";
                return callback(2, 'create_toy_fail', 400, error, null);
            });
        }catch(error){
            return callback(3, 'create_toy_fail', 400, error, null);
        }
    },

    getAll: function(query, callback){
        try {
            let where ={};
            let page = 1;
            let perPage = Constant.DEFAULT_PAGING_SIZE
            let sort = [];
            this.parseFilter(where, query.filter);  
            // WHERE 
     
          
            if( Pieces.VariableBaseTypeChecking(query.toyName, 'string') ){
                where.toyName = {[Sequelize.Op.like]:query.toyName +"%"};
            }           
            if( Pieces.VariableBaseTypeChecking(query.sex, 'string') ){
                where.sex = query.sex;
            }
            if( Pieces.VariableBaseTypeChecking(query.age, 'string') ){
                where.age = query.age;
            }
            if( Pieces.VariableBaseTypeChecking(query.city, 'string') ){
                where.city = query.city;
            }
            if( Pieces.VariableBaseTypeChecking(query.condition, 'string') ){
                where.condition = query.condition;
            }     
            
            if(query.category != undefined)
            {
                where.category = query.category;
            }
            if((query.min != undefined) && (query.max != undefined) )
            {
                where.ecoin= { [Sequelize.Op.between]:[query.min, query.max] };
            }
            if(query.createdBy != undefined)
            {
                where.createdBy = query.createdBy;
            }
            let where_tag_toy={};
            let k;
            if(query.tag != undefined)
            {
                console.log(query.tag);
                where_tag_toy.tag = query.tag;
                k=true;
            }
            else{
                k=false;
            }          
            // WHERE
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
            let offset = perPage * (page - 1);
    
            // Toy.hasMany(Asset);
            Toy.hasMany(Asset, {
                foreignKey: "toyid",               
              });
            Asset.belongsTo(Toy, {
                foreignKey: "toyid",              
              });
            Toy.hasMany(Tag_Toy, {
                foreignKey: "toyid",               
              });
            Tag_Toy.belongsTo(Toy, {
                foreignKey: "toyid",              
              });
            Toy.findAndCountAll({         
                    where: where,   
                   
                    include: [{                     
                        model: Tag_Toy,    
                        required :k ,
                        where : where_tag_toy,                                                              
                      },
                      {
                        model: Asset,                   
                      }],
                    limit: perPage,
                    offset: offset,
                    order: sort
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
                    return callback(1, 'find_and_count_all_toy_fail', 420, error, null);
                });
        }catch(error){
            return callback(1, 'get_all_toy_fail', 400, error, null);
        }
    },

    get_new_toy: function(callback){
        try {         
             
            
            // Toy.hasMany(Asset);
            Toy.hasMany(Asset, {
                foreignKey: "toyid",               
              });
            Asset.belongsTo(Toy, {
                foreignKey: "toyid",              
              });
            Toy.hasMany(Tag_Toy, {
                foreignKey: "toyid",               
              });
            Tag_Toy.belongsTo(Toy, {
                foreignKey: "toyid",              
              });
            Toy.findAll({          
                    include: [{                     
                        model: Tag_Toy,                                                                        
                      },
                      {
                        model: Asset,                   
                      }],
                    limit: 10,
                    order:  [['createdAt', 'DESC']]
                })
             
                .then((data) => {    
           
                    return callback(null, null, 200, null,data);
                }).catch(function (error) {
                    return callback(1, 'find_and_count_all_toy_fail', 420, error, null);
                });
        }catch(error){
            return callback(1, 'get_all_toy_fail', 400, error, null);
        }
    },
    get_toy_byid: function(accessUserId,callback){
        try {            
            // Toy.hasMany(Asset);
            Toy.hasMany(Asset, {
                foreignKey: "toyid",               
              });
            Asset.belongsTo(Toy, {
                foreignKey: "toyid",              
              });
            Toy.hasMany(Tag_Toy, {
                foreignKey: "toyid",               
              });
            Tag_Toy.belongsTo(Toy, {
                foreignKey: "toyid",              
              });
            Toy.findAll({                             
                    include: [{                     
                        model: Tag_Toy,                                                                        
                      },
                      {
                        model: Asset,                   
                      }],
                    where :{createdBy : accessUserId},
                })
                .then((data) => {         
                    return callback(null, null, 200, null,data);
                }).catch(function (error) {
                    return callback(1, 'find_and_count_all_toy_fail', 420, error, null);
                });
        }catch(error){
            return callback(1, 'get_all_toy_fail', 400, error, null);
        }
    },


    update: function (accessUserId, accessUserType, toyId, toyData, assetData, callback) {
        try {        
            let queryObj = {};  
            if ( !( Pieces.VariableBaseTypeChecking(toyId,'string')
                    && Validator.isInt(toyId) )
                && !Pieces.VariableBaseTypeChecking(toyId,'number') ){
                return callback(1, 'invalid_category_id', 400, 'category id is incorrect', null);
            }
            let temp = parseInt(toyData.ecoin);
            if (toyData.toyName != null)
            {
                if ( !Pieces.VariableBaseTypeChecking(toyData.toyName, 'string')
                || !Validator.isLength(toyData.toyName, {min: 5, max: 128}) ) {
                    return callback(1, 'invalid_toy_name', 400, 'length 4-128', null);             
                }
                else
                {
                    queryObj.toyName= toyData.toyName;
                }
            }
            
            if (toyData.ecoin != null)
            {
            if (!Pieces.VariableBaseTypeChecking(temp,'number'))
            {
                return callback(1, 'invalid_ecoin', 400, 'ecoin is not type int', null);
            }
            else
            {
                queryObj.ecoin = toyData.ecoin;
            }
            if (toyData.ecoin > 200000 )
            {
                return callback(1, 'invalid_ecoin', 400, 'ecoin is less than 200000', null);
            }
            else
            {
                queryObj.ecoin = toyData.ecoin;
            }
            }
            //Asset
            // if (assetData==undefined)
            // {
            // return callback(1, 'You must select file', 400, null, null);
            // }    
            let asssetObj = [];                              
            assetData.forEach((value) => {
                asssetObj.push(value.path);              
            });

            
            let queryObj_del = [];     
            //     toyData.assetDel.forEach((value) => {
            //         queryObj_del.push(value.substr(-34, 30));              
            // });   
            let arr_asset_del;
            if (toyData.assetDel != null)
            {
                arr_asset_del = JSON.parse( JSON.stringify(toyData.assetDel));           
                arr_asset_del.forEach((value) => {
                    queryObj_del.push(value.url.substr(-34, 30));              
                });   
            }
         
            let d = "" ;
            //Asset
            let where ={}
            
            let tagObj = {};
      
           
            queryObj.sex = toyData.sex;
            queryObj.age = toyData.age;
            queryObj.city = toyData.city;
            queryObj.condition = toyData.condition;
           
            queryObj.description = toyData.description
            queryObj.category = toyData.category;
            queryObj.updatedAt = new Date();
           
            where.id = toyId;  
                     
            Toy.update(queryObj,{where: where}).then(result=>{
                "use strict";   
                
                if (toyData.tag != null)
                {
                    Tag_Toy.destroy(
                        {
                            where: {toyid:toyId}
                        }
                        ).then(tagtoy=>{  
                            "use strict";                          
                        }).catch(function(error){
                            "use strict";
                            return callback(2, 'delete_tag_fail', 400, error, null);
                        }); 
                        // for (let i =0 ;i<toyData.tag.length;i++)
                        // {
                        //     tagObj.tag=toyData.tag[i];
                        //     tagObj.toyid=toyId;
                        //     tagObj.createdBy = accessUserId;
                        //     tagObj.updatedBy = accessUserId;  
                        //     Tag_Toy.create(tagObj).then(tagtoy=>{  
                        //         "use strict";                          
                        //     }).catch(function(error){
                        //         "use strict";
                        //         return callback(2, 'create_asset_fail', 400, error, null);
                        //     });  
                        // }
                        let arrTag = JSON.parse( JSON.stringify(toyData.tag));
                        for (let i =0 ;i<arrTag.length;i++)
                        {
                            tagObj.tag=arrTag[i].id;
                            tagObj.toyid=toyId;
                            tagObj.createdBy = accessUserId;
                            tagObj.updatedBy = accessUserId;  
                            Tag_Toy.create(tagObj).then(tagtoy=>{  
                                "use strict";                          
                            }).catch(function(error){
                                "use strict";
                                return callback(2, 'create_asset_fail', 400, error, null);
                            });  
                        }
                }
            
                Cloudinary.deleteMutiple(queryObj_del,result_del => {          
                    if (result_del.result === "ok")
                    {
                        // for (let i = 0; i<toyData.assetDel.length;i++)
                        // {
                            
                        //     Asset.destroy({
                        //         where: {url:toyData.assetDel[i]}
                        //     }).catch(function(error){
                        //         "use strict";
                        //         return callback(2, 'delete_asset_fail', 402, error, null);
                        //     }); 
                        // }
                        for (let i = 0; i < arr_asset_del.length;i++)
                        {                         
                            Asset.destroy({
                                where: {url:arr_asset_del[i].url}
                            }).catch(function(error){
                                "use strict";
                                return callback(2, 'delete_asset_fail', 402, error, null);
                            }); 
                        }
                    }
                })   
                
                Cloudinary.uploadMutiple(asssetObj,result => {
                    const convertedData = result.map(arrObj => {
                        return{
                            toyid :toyId,
                            url : arrObj,   
                            createdBy : accessUserId,
                            updatedBy : accessUserId  
                        }
                    })
               
                    Asset.bulkCreate(convertedData).catch(function(error){
                        "use strict";
                        return callback(2, 'create_asset_fail', 402, error, null);
                    });    
                })              
                return callback(null, null, 200, null, result);              
                
            }).catch(function(error){
                "use strict";
                return callback(2, 'update_toy_fail', 400, error, null);
            });
            
        }catch(error){
            return callback(3, 'update_toy_fail', 400, error, null);
        }
            
    },


    delete: function(accessUserType, id, callback) {
        try {
            let where = {};
            let where_asset = {};
            if ( !( Pieces.VariableBaseTypeChecking(id,'string') && Validator.isInt(id) )
                && !Pieces.VariableBaseTypeChecking(id,'number') ){
                return callback(1, 'invalid_toy_id', 400, 'toy id is incorrect', null);
            }
            let queryObj_del = [];  
            where = { id: id };    
            where_asset = { toyid:id};       
            Asset.findAll({where:where_asset}).then(asset=>{
                "use strict";                          
                for (let i =0; i<asset.length;i++)
                {               
                        queryObj_del.push(asset[i].dataValues.url.substr(-34, 30));     
                                    
                }  
                Cloudinary.deleteMutiple(queryObj_del,result_del => {         
                    if (result_del.result === "ok")
                    {           
                            Asset.destroy({
                                where: where_asset
                            }).catch(function(error){
                                "use strict";
                                return callback(2, 'delete_asset_fail', 402, error, null);
                            }); 
                    }
                })   
                Toy.destroy({where: where}).then(result => {
                    "use strict";
                    return callback(null, 'Delete success', 200, null);  
                }).catch(function(error){
                    return callback(1, 'remove_toy_fail', 420, error)            
                })                                         
            }).catch(function(error){              
                return callback(3, 'remove_toy_fail', 400, error, null);
            });             
        }catch(error){
            return callback(2, 'delete_toy_fail', 400, error);
        }
    },

    getOne: function(accessUserId, accessUserType, id, callback) {
        try {
            // kiem tra giá trị rỗng
            if ( !( Pieces.VariableBaseTypeChecking(id,'string') && Validator.isInt(id) )
                && !Pieces.VariableBaseTypeChecking(id,'number') ){
                return callback(1, 'invalid_toy_id', 400, 'toy id is incorrect', null);
            }        
            let where = {};
            where = {id: id};
            console.log(where);
            User.hasMany(Toy, {              
                foreignKey: 'createdBy',                            
              });
            Toy.belongsTo(User, { foreignKey: 'createdBy' });      
            Toy.hasMany(Asset, {
                foreignKey: "toyid",               
              });
            Asset.belongsTo(Toy, {
                foreignKey: "toyid",              
              });
            Toy.hasMany(Tag_Toy, {
                foreignKey: "toyid",               
              });
            Tag_Toy.belongsTo(Toy, {
                foreignKey: "toyid",              
              });

            Toy.findOne({
                where: where,   
                include: [{                     
                    model: Tag_Toy,                                                            
                    },
                    {
                    model: Asset,                   
                    },
                    {                     
                    model: User,                                                            
                    },],
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if(result){
                    console.log(result);
                    return callback(null, null, 200, null, result);
                }else{
                    return callback(1, 'invalid_toy', 403, null, null);
                }
            });
        }catch(error){
            return callback(1, 'get_one_toy_fail', 400, error, null);
        }
    },  

    getToyByUser: function(accessUserId, accessUserType, id, callback) {
        try {
            // kiem tra giá trị rỗng
            if ( !( Pieces.VariableBaseTypeChecking(id,'string') && Validator.isInt(id) )
                && !Pieces.VariableBaseTypeChecking(id,'number') ){
                return callback(1, 'invalid_user_id', 400, 'user id is incorrect', null);
            }        
            let where = {};
            where = {createdBy: id};

            Toy.hasMany(Asset, {
                foreignKey: "toyid",               
              });
            Asset.belongsTo(Toy, {
                foreignKey: "toyid",              
              });
            Toy.hasMany(Tag_Toy, {
                foreignKey: "toyid",               
              });
            Tag_Toy.belongsTo(Toy, {
                foreignKey: "toyid",              
              });

            Toy.findAll({
                where: where,   
                include: [{                     
                    model: Tag_Toy,                                                            
                    },
                    {
                    model: Asset,                   
                    },
                   ],
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if(result){
                    console.log(result);
                    return callback(null, null, 200, null, result);
                }else{
                    return callback(1, 'invalid_toy', 403, null, null);
                }
            });
        }catch(error){
            return callback(1, 'get_one_toy_fail', 400, error, null);
        }
    },  
   
    getStatistic: function(accessUserId, accessUserType, callback) { 
        try {
            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'user is not right', 400, null, null);
            }
            let final = {};
            final = { total: 0};
            Toy.count({
                where:{},
            }).then(function(total){ // giống trên 
                "use strict";
                final.total = total;
                return callback(null, null, 200, null, final);
            }).catch(function(error){
                "use strict";
                return callback(1, 'count_toy_fail', 400, error, null);
            });
        }catch(error){
            return callback(2, 'statistic_toy_fail', 400, error, null);
        }
    },
    getSumEcoin: function(accessUserId, accessUserType, callback) { 
        try {
            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'user is not right', 400, null, null);
            }
            let final = {};
            final = { total: 0};
            Toy.sum(
                'ecoin',
                {
                where:{},
            }).then(function(total){ // giống trên 
                "use strict";
                final.total = total;
                return callback(null, null, 200, null, final);
            }).catch(function(error){
                "use strict";
                return callback(1, 'count_toy_fail', 400, error, null);
            });
        }catch(error){
            return callback(2, 'statistic_toy_fail', 400, error, null);
        }
    },

    getSumEcoinSold: function(accessUserId, accessUserType, callback) { 
        try {
            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'user is not right', 400, null, null);
            }
            let final = {};
            final = { total: 0};
            Toy.sum(
                'ecoin',
                {
                where:{
                    status : 'SOLD'
                },
            }).then(function(total){ // giống trên 
                "use strict";
                final.total = total;
                return callback(null, null, 200, null, final);
            }).catch(function(error){
                "use strict";
                return callback(1, 'count_toy_fail', 400, error, null);
            });
        }catch(error){
            return callback(2, 'statistic_toy_fail', 400, error, null);
        }
    },

    getAnalysis: function(accessUserId, accessUserType, callback) { 
        try {
      
            let final = {};
            final = {ready: 0, total: 0,pending: 0,sold: 0};
            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'invalid_user_type', 400, null, null);
            }
            Toy.count({
                where:{},
            }).then(function(total){ // giống trên 
                "use strict";
                final.total = total;
                Toy.count({
                    where:{status: 'READY'},
                }).then(function(ready){
                    final.ready = ready;           
                }).catch(function(error){
                    "use strict";
                    return callback(1, 'count_user_fail', 400, error, null);
                });
                Toy.count({
                    where:{status: 'PENDING'},
                }).then(function(pending){
                    final.pending = pending;
                  
                }).catch(function(error){
                    "use strict";
                    return callback(1, 'count_user_fail', 400, error, null);
                });
             
                Toy.count({
                    where:{status: 'SOLD'},
                }).then(function(sold){
                    final.sold = sold;
                    return callback(null, null, 200, null, final);
                }).catch(function(error){
                    "use strict";
                    return callback(1, 'count_user_fail', 400, error, null);
                });
            }).catch(function(error){
                "use strict";
                return callback(1, 'count_user_fail', 400, error, null);
            });
        }catch(error){
            return callback(2, 'statistic_user_fail', 400, error, null);
        }
    },

    // // --------- others ----------
    parseFilter: function(condition, filters) {
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
