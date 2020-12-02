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
const Category = Models.Category;


module.exports = {
    create : function (accessUserId,accessUserType, categoryData, callback) {
        try {
            if ( !Pieces.VariableBaseTypeChecking(categoryData.value,'string') ) {
                return callback(1, 'invalid_category_value', 400, 'value is not a string', null);
            }

            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'user is not right', 400, null, null);
            }

            Category.findOne({ where: { value:categoryData.value } }).then(result=>{
                "use strict";
                if (result)
                {
                    return callback(2, 'category value exisits', 400, null, null);
                }
            })

            let queryObj = {};
            queryObj.value = categoryData.value;
            queryObj.parent_id = categoryData.parent_id;
            queryObj.createdBy = accessUserId;
            queryObj.updatedBy = accessUserId;
            
            Category.create(queryObj).then(result=>{
                "use strict";
                
                return callback(null, null, 200, null, result);
            }).catch(function(error){
                "use strict";
                return callback(2, 'create_category_fail', 400, error, null);
            });
        }catch(error){
            return callback(3, 'create_category_fail', 400, error, null);
        }
    },

    getAll: function(accessUserId, accessUserType, query, callback){
        try {
            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'invalid_user_type', 400, null, null);
            }
            let where={};
            let page = 1;
            let perPage = Constant.DEFAULT_PAGING_SIZE
            let sort = [];
            this.parseFilter(accessUserId, accessUserType, where, query.filter);
            
            if( Pieces.VariableBaseTypeChecking(query.q, 'string') ){
                console.log("1");
                where.value = {[Sequelize.Op.like]:query.q +"%"};
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
            let offset = perPage * (page - 1);
            Category.findAndCountAll({
                    where: where,
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
                    return callback(1, 'find_and_count_all_category_fail', 420, error, null);
                });
        }catch(error){
            return callback(1, 'get_all_category_fail', 400, error, null);
        }
    },

    getAllCB: function(accessUserId, accessUserType, callback){
        try {
            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'invalid_user_type', 400, null, null);
            }
            let where={}
            where.parent_id =null
            Category.findAll({
                    where: where,
                })
                .then((data) => {
                    return callback(null, null, 200, null, data);
                }).catch(function (error) {
                    return callback(1, 'findall_category_fail', 420, error, null);
                });
        }catch(error){
            return callback(1, 'get_all_category_fail', 400, error, null);
        }
    },

    update: function (accessUserId, accessUserType,categoryId, updateData, callback) {
        try {
            let queryObj = {};
            let where = {};

            Category.findOne({ where: { value:updateData.value } }).then(result=>{
                "use strict";
                if (result)
                {
                    return callback(2, 'category value exisits', 400, null, null);
                }
            })

            if ( !( Pieces.VariableBaseTypeChecking(categoryId,'string')
                    && Validator.isInt(categoryId) )
                && !Pieces.VariableBaseTypeChecking(categoryId,'number') ){
                return callback(1, 'invalid_category_id', 400, 'category id is incorrect', null);
            }

            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(2, 'invalid_user_right', 400, null, null);
            }

            queryObj.updatedBy = accessUserId; //set
            where.id = categoryId; //where 
            if ( Pieces.VariableBaseTypeChecking(updateData.value, 'string'))
            {                   
                queryObj.value = updateData.value;
            }    
            queryObj.parent_id = updateData.parent_id;    
            queryObj.updatedAt = new Date();

            Category.update(
                queryObj,
                {where: where}).then(result=>{
                    "use strict";
                    if( (result !== null) && (result.length > 0) && (result[0] > 0) ){
                        return callback(null, null, 200, null, categoryId);
                    }else{
                        return callback(1, 'update_category_fail', 400, '', null);
                    }
            }).catch(function(error){
                "use strict";
                return callback(1, 'update_category_fail', 400, error, null);
            });
        }catch(error){
            return callback(2, 'update_category_fail', 400, error, null);
        }
    },


    delete: function(accessUserType, id, callback) {
        try {
            let where = {};
            if ( !( Pieces.VariableBaseTypeChecking(id,'string') && Validator.isInt(id) )
                && !Pieces.VariableBaseTypeChecking(id,'number') ){
                return callback(1, 'invalid_category_id', 400, 'category id is incorrect', null);
            }
            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'invalid_user_type', 403, null);
            }
            where = { id: id };           
            Category.destroy({where: where}).then(result => {
                return callback(null, null, 200, null);
            }).catch(function(error){
                return callback(1, 'remove_category_fail', 420, error)            
            })     
        }catch(error){
            return callback(2, 'delete_category_fail', 400, error);
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
