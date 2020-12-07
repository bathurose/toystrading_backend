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
const Tag = Models.Tag;
module.exports = {
    create : function (accessUserId,accessUserType, tagData, callback) {
        try {
           
            if ( !Pieces.VariableBaseTypeChecking(tagData,'string') ) {
           
                return callback(2, 'invalid_tag_value', 400, 'value is not a string', null);
            }          
            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
             
                return callback(1, 'invalid_user_type', 400, null, null);
            }

        
            Tag.findOne({
                where: {value:tagData},
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if (result)
                {
                    return callback(2, 'tag exisits', 400, "", null);
                }
                }).catch(function(error){
                    "use strict";
                    return callback(2, 'update_user_fail', 400, error, null);
                });

            let queryObj = {};
            queryObj.value = tagData;
            queryObj.createdBy = accessUserId;
            queryObj.updatedBy = accessUserId;
            console.log(tagData);
            Tag.create(queryObj).then(result=>{
                "use strict";
                return callback(null, null, 200, null, result);
            }).catch(function(error){
                "use strict";
                return callback(1, 'create_tag_fail (the tag value exsists )', 400, error, null);
            });
        }catch(error){
            return callback(2, 'create_tag_fail', 400, error, null);
        }
    },

    // getOne: function(accessUserId, accessUserType, id, callback) {
    //     try {
    //         // kiem tra giá trị rỗng
    //         if ( !( Pieces.VariableBaseTypeChecking(id,'string') && Validator.isInt(id) )
    //             && !Pieces.VariableBaseTypeChecking(id,'number') ){
    //             return callback(1, 'invalid_user_id', 400, 'user id is incorrect', null);
    //         }
    //         // kiểm tra cấp độ
    //         if ( (accessUserId !== id) && (accessUserType < Constant.USER_TYPE.MODERATOR) ) {
    //             return callback(1, 'invalid_user_type', 403, null, null);
    //         }


    //         let where = {};
    //         let attributes = ['id', 'loginName','email','type', 'displayName', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'];

    //         if(accessUserId !== parseInt(id)) {
    //             where = {id: id, type: { [Sequelize.Op.lt]: accessUserType} };
    //         }else{
    //             where = {id: id};
    //         }

    //         User.findOne({
    //             where: where,
    //             attributes: attributes,
    //         }).then(result=>{// result kq trả về từ câu query 
    //             "use strict";
    //             if(result){
    //                 return callback(null, null, 200, null, result);
    //             }else{
    //                 return callback(1, 'invalid_account', 403, null, null);
    //             }
    //         });
    //     }catch(error){
    //         return callback(1, 'get_one_account_fail', 400, error, null);
    //     }
    // },
    

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
            Tag.findAndCountAll({
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
                    return callback(1, 'find_and_count_all_tag_fail', 420, error, null);
                });
        }catch(error){
            return callback(2, 'get_all_tag_fail', 400, error, null);
        }
    },


    update: function (accessUserId, accessUserType,tagId, updateData, callback) {
        try {
            let queryObj = {};
            let where = {};
            if ( !( Pieces.VariableBaseTypeChecking(tagId,'string')
                    && Validator.isInt(tagId) )
                && !Pieces.VariableBaseTypeChecking(tagId,'number') ){
                return callback(1, 'invalid_tag_id', 400, 'tag id is incorrect', null);
            }
            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'invalid_user_right', 400, null, null);
            }
            queryObj.updatedBy = accessUserId; //set
            where.id = tagId; //where 
            if ( Pieces.VariableBaseTypeChecking(updateData, 'string'))
            {                   
                queryObj.value = updateData;
            }        
            queryObj.updatedAt = new Date();
            Tag.update(
                queryObj,
                {where: where}).then(result=>{
                    "use strict";
                    if( (result !== null) && (result.length > 0) && (result[0] > 0) ){
                        return callback(null, null, 200, null, tagId);
                    }else{
                        return callback(1, 'update_tag_fail', 400, '', null);
                    }
            }).catch(function(error){
                "use strict";
                return callback(1, 'update_tag_fail', 400, error, null);
            });
        }catch(error){
            return callback(2, 'update_tag_fail', 400, error, null);
        }
    },


    delete: function(accessUserType, id, callback) {
        try {
            let where = {};
            if ( !( Pieces.VariableBaseTypeChecking(id,'string') && Validator.isInt(id) )
                && !Pieces.VariableBaseTypeChecking(id,'number') ){
                return callback(1, 'invalid_tag_id', 400, 'tag id is incorrect', null);
            }
            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'invalid_tag_right', 400, null);
            }
            where = { id: id };           
            Tag.destroy({where: where}).then(result => {
                return callback(null, null, 200, null);
            }).catch(function(error){
                return callback(1, 'delete_tag_fail', 400, error)            
            }) 
        
        }catch(error){
            return callback(2, 'delete_tag_fail', 400, error);
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
