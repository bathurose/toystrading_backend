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
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail')
require("dotenv").config()

const Models = require('../models');
const User = Models.User;

module.exports = {

    getOne: function(accessUserId, accessUserType, id, callback) {
        try {
            // kiem tra giá trị rỗng
            if ( !( Pieces.VariableBaseTypeChecking(id,'string') && Validator.isInt(id) )
                && !Pieces.VariableBaseTypeChecking(id,'number') ){
                return callback(1, 'invalid_user_id', 400, 'user id is incorrect', null);
            }
            // kiểm tra cấp độ
            if ( (accessUserId !== id) && (accessUserType == Constant.USER_TYPE.MODERATOR) ) {
                return callback(1, 'invalid_user_type', 400, null, null);
            }
    
           

            User.findOne({
                where: {id: id},
               
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if(result){
                    return callback(null, null, 200, null, result);
                }else{
                    return callback(1,'get_one_account_fail', 400, null, null);
                }
            });
        }catch(error){
            return callback(2,'get_one_account_fail', 400, error, null);
        }
    },
    getOneOnly: function(accessUserId, accessUserType, callback) {
        try {
            User.findOne({
                where: {id: accessUserId}
              
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if(result){
                    return callback(null, null, 200, null, result);
                }else{
                    return callback(1,'get_one_account_fail', 400, null, null);
                }
            });
        }catch(error){
            return callback(2,'get_one_account_fail', 400, error, null);
        }
    },
    // thống kê user, toys
    getStatisticNew: function(accessUserId, accessUserType, callback) { 
        try {
            let final = {};
            final = {activated: 0, total: 0};
            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'invalid_user_type', 400, null, null);
            }
            User.count({
                where:{},
            }).then(function(total){ // giống trên 
                "use strict";
                final.total = total;
                User.count({
                    where:{activated: 1},
                }).then(function(activated){
                    final.activated = activated;
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


    getAll: function(accessUserId, accessUserType, query, callback){
        try {
            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'invalid_user_type', 400, null, null);
            }

            let where;
            let cond1 = {};
            let page = 1;
            let perPage = Constant.DEFAULT_PAGING_SIZE;
            let sort = [];
            let attributes = [];


            cond1.type = {[Sequelize.Op.lt]: accessUserType};

            this.parseFilter(accessUserId, accessUserType, cond1, query.filter);

            if( Pieces.VariableBaseTypeChecking(query.q, 'string') ){
                cond1.userName = {[Sequelize.Op.like]: query.q +"%"};
            }

            where = {[Sequelize.Op.or]:[{id: accessUserId} ,cond1] };
            where.type=1; 
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
            User.findAndCountAll({
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
                    return callback(1, 'find_and_count_all_user_fail', 420, error, null);
                });
        }catch(error){
            return callback(2, 'get_all_user_fail', 400, error, null);
        }
    },


    update: function (accessUserId, accessUserType,userId, updateData, callback) {
        try {
            let queryObj = {};
            let where = {};

            if ( !( Pieces.VariableBaseTypeChecking(userId,'string')
                    && Validator.isInt(userId) )
                && !Pieces.VariableBaseTypeChecking(userId,'number') ){
                return callback(1, 'invalid_user_id', 400, 'user id is incorrect', null);
            }

            queryObj.updatedBy = accessUserId; //set
            queryObj.updatedAt = new Date();
            where.id = userId; //where 
            User.findOne({
                where: {email:updateData.email},
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if (result)
                {
                    return callback(2, 'email exisits', 400, "", null);
                }
                }).catch(function(error){
                    "use strict";
                    return callback(2, 'update_user_fail', 400, error, null);
                });

            User.findOne({
                where: {userName :updateData.userName },
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if (result)
                {
                    return callback(2, 'username exisits', 400, "", null);
                }
                }).catch(function(error){
                    "use strict";
                    return callback(2, 'update_user_fail', 400, error, null);
                });
                 
            if ( Pieces.VariableBaseTypeChecking(updateData.userName, 'string')
                && Validator.isLength(updateData.userName, {min: 4, max: 64}) ) {                 
                queryObj.userName = updateData.userName;
            }

            if (Pieces.VariableBaseTypeChecking(updateData.email, 'string')
                && Validator.isEmail(updateData.email)) {
                queryObj.email = updateData.email;
            }

       
            if(Pieces.ValidObjectEnum(updateData.type, Constant.USER_TYPE)){
                queryObj.type = updateData.type;
            }
            
            if ( Validator.isLength(updateData.phone, {min: 10, max: 12})) {      
                queryObj.phone = updateData.phone;
            }

      
            User.update(
                queryObj,
                {where: where}).then(result=>{
                    "use strict";
                    if( (result !== null) && (result.length > 0) && (result[0] > 0) ){
                        return callback(null, null, 200, null, userId);
                    }else{
                        return callback(1, 'update_user_fail', 400, '', null);
                    }
            }).catch(function(error){
                "use strict";
                return callback(1, 'update_user_fail', 420, error, null);
            });
        }catch(error){
            return callback(2, 'update_user_fail', 400, error, null);
        }
    },
    updateOnly: function (accessUserId, accessUserType, updateData, callback) {
        try {
            let queryObj = {};
            let where = {};
            queryObj.updatedAt = new Date();
            where.id = accessUserId; //where 
            User.findOne({
                where: {phone:updateData.phone},
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if (result)
                {
                    return callback(2, 'phone exisits', 400, "", null);
                }
                }).catch(function(error){
                    "use strict";
                    return callback(2, 'update_user_fail', 400, error, null);
                });
                
            User.findOne({
                where: {email:updateData.email},
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if (result)
                {
                    return callback(2, 'email exisits', 400, "", null);
                }
                }).catch(function(error){
                    "use strict";
                    return callback(2, 'update_user_fail', 400, error, null);
                });
            User.findOne({
                where: {userName :updateData.userName },
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if (result)
                {
                    return callback(2, 'username exisits', 400, "", null);
                }
                }).catch(function(error){
                    "use strict";
                    return callback(2, 'update_user_fail', 400, error, null);
                });
                if (updateData.newPassword != null)
                {
                    if ( Pieces.VariableBaseTypeChecking(updateData.newPassword, 'string')
                        && Validator.isLength(updateData.newPassword, {min: 4, max: 64}) ) {
                        queryObj.password = BCrypt.hashSync(updateData.newPassword, 10);
                    }  
                    else
                    {
                        return callback(2, 'password_incorrect', 400, error, null);
                    }  
                }
            
            if (updateData.userName != null)
            {
                if ( Pieces.VariableBaseTypeChecking(updateData.userName, 'string')
                    && Validator.isLength(updateData.userName, {min: 4, max: 64}) ) {                 
                    queryObj.userName = updateData.userName;
                }
                else
                {
                    return callback(2, 'userName_incorrect', 400, error, null);
                }  
             }
         
            if (updateData.phone != null)
            {
                if ( Validator.isLength(updateData.phone, {min: 10, max: 12})) {      
                    queryObj.phone = updateData.phone;
                }
                else
                {
                    return callback(2, 'phone_incorrect', 400, error, null);
                }  
            }
            User.update(
                queryObj,
                {where: where}).then(result=>{
                    "use strict";
                    if( (result !== null) && (result.length > 0) && (result[0] > 0) ){
                        return callback(null, null, 200, null, accessUserId);
                    }else{
                        return callback(1, 'update_user_fail', 400, '', null);
                    }
            }).catch(function(error){
                "use strict";
                return callback(1, 'update_user_fail', 420, error, null);
            });
        }catch(error){
            return callback(2, 'update_user_fail', 400, error, null);
        }
    },
    updatePW: function (accessUserId, accessUserType,userId, updateData, callback) {
        try {
            let queryObj = {};
            let where = {};

            if ( !( Pieces.VariableBaseTypeChecking(userId,'string')
                    && Validator.isInt(userId) )
                && !Pieces.VariableBaseTypeChecking(userId,'number') ){
                return callback(1, 'invalid_user_id', 400, 'user id is incorrect', null);
            }

            if ( accessUserId !== parseInt(userId) && accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'invalid_user_right', 403, null, null);
            }
     
            queryObj.updatedBy = accessUserId; //set
            queryObj.updatedAt = new Date();

            where.id = userId; //where 

            User.findOne( {
                where: where,
            }).then( account=>{
                "use strict";       
                BCrypt.compare( updateData.password, account.password, function (error, result) {
                    if (result === true) {
                        if ( Pieces.VariableBaseTypeChecking(updateData.newPassword, 'string')
                            && Validator.isLength(updateData.newPassword, {min: 4, max: 64}) ) {
                             queryObj.password = BCrypt.hashSync(updateData.newPassword, 10);
                        }
                        User.update(
                            queryObj,
                            {where: where}).then(result=>{
                                "use strict";
                                    return callback(null, null, 200, null, userId);
                        }).catch(function(error){
                            "use strict";
                            return callback(1, 'update_user_fail', 420, error, null);
                        });
                    } else {
                        return callback(1, 'wrong_password', 422, null, null);
                    }
                });                         
                }).catch(function(error){
                "use strict";
                return callback(1, 'find_one_user_fail', 400, error, null);
            });      
        }catch(error){
            return callback(2, 'update_user_fail', 400, error, null);
        }
    },


    delete: function(accessUserType, id, callback) {
        try {
            let queryObj = {};
            let where = {};

            if ( !( Pieces.VariableBaseTypeChecking(id,'string') && Validator.isInt(id) )
                && !Pieces.VariableBaseTypeChecking(id,'number') ){
                return callback(1, 'invalid_user_id', 400, 'user id is incorrect', null);
            }

            if ( accessUserType == Constant.USER_TYPE.MODERATOR ) {
                return callback(1, 'invalid_user_right', 403, null);
            }

            where = { id: id };
            queryObj = { activated: Constant.ACTIVATED.NO };

            User.findOne({where:where}).then(account=>{
                "use strict";
                if ( account && account.activated === Constant.ACTIVATED.NO ){
                    User.destroy({where: where}).then(result => {
                        return callback(null, null, 200, null);
                    }).catch(function(error){
                        return callback(1, 'remove_account_fail', 420, error);
                    });
                }else {
                    User.update(queryObj, {where: where}).then(result=>{
                        "use strict";
                        return callback(null, null, 200, null);
                    }).catch(function(error){
                        return callback(1, 'update_account_fail', 420, error);
                    })
                }
            }).catch(function(error){
                "use strict";
                return callback(1, 'find_one_account_fail', 400, error, null);
            });
        }catch(error){
            return callback(2, 'delete_account_fail', 400, error);
        }
    },

    deletes: function (accessUserType, ids, callback) {
        try {
            if ( !Pieces.VariableBaseTypeChecking(ids,'string')
                    || !Validator.isJSON(ids) ) {
                return callback(1, 'invalid_user_ids', 400, 'user id list is not a json array string');
            }
            if(accessUserType == Constant.USER_TYPE.MODERATOR){
                return callback(1, 'invalid_user_right', 403, null);
            }

            let idLists = Pieces.safelyParseJSON(ids);
            let where = {id: {[Sequelize.Op.in]: idLists}};

            let queryObj = {activated: Constant.ACTIVATED.NO};

            User.update(queryObj, {where: where}).then(result=>{
                "use strict";
                if ( result && (result.length > 0) && result[0] > 0 ) {
                    return callback(null, null, 200, null);
                } else {
                    return callback(1, 'invalid_user_request', 404, null);
                }
            }).catch(function(error){
                "use strict";
                return callback(1, 'update_user_fail', 420, error);
            });
        }catch(error){
            return callback(2, 'deletes_user_fail', 400, error);
        }
    },

    verifyEmail: function (accessUserId, accessUserType, accessLoginName, callback) {
        try {
            if ( !( Pieces.VariableBaseTypeChecking(accessUserId,'string')
                    && Validator.isInt(accessUserId) )
                && !Pieces.VariableBaseTypeChecking(accessUserId,'number') ){
                return callback(1, 'invalid_user_id', 400, 'user id is incorrect', null);
            }

            if( !Pieces.VariableBaseTypeChecking(accessUserType,'number') ){
                return callback(1, 'invalid_user_type', 400, 'user type is incorrect', null);
            }

            if( !Pieces.VariableBaseTypeChecking(accessLoginName,'string') ) {
                return callback(1, 'invalid_user_username', 400, 'login name is incorrect', null);
            }
            let where = {id: accessUserId, userName:accessLoginName, type:accessUserType, activated:Constant.ACTIVATED.YES};
            let attributes = ['id', 'userName','email','type', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'];

            User.findOne({
                where: where,
                attributes: attributes
            }).then(result=>{
                "use strict";
                if(result){
                    return callback(null, null, 200, null, result);
                }else{
                    return callback(1, 'invalid_user', 403, null, null);
                }
            }).catch(function(error){
                "use strict";
                return callback(1, 'find_one_user_fail', 400, error, null);
            });
        }catch(error){
            return callback(1, 'find_one_user_fail', 400, error, null);
        }
    },
    // định danh 
    verifyUser: function (accessUserId, accessUserType, accessLoginName, callback) {
        try {
            if ( !( Pieces.VariableBaseTypeChecking(accessUserId,'string')
                    && Validator.isInt(accessUserId) )
                && !Pieces.VariableBaseTypeChecking(accessUserId,'number') ){
                return callback(1, 'invalid_user_id', 400, 'user id is incorrect', null);
            }

            if( !Pieces.VariableBaseTypeChecking(accessUserType,'number') ){
                return callback(1, 'invalid_user_type', 400, 'user type is incorrect', null);
            }

            if( !Pieces.VariableBaseTypeChecking(accessLoginName,'string') ) {
                return callback(1, 'invalid_user_username', 400, 'login name is incorrect', null);
            }


            let where = {id: accessUserId,  type:accessUserType, activated:Constant.ACTIVATED.YES};
            let attributes = ['id', 'userName','email','type', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'];

            User.findOne({
                where: where,
                attributes: attributes
            }).then(result=>{
                "use strict";
                if(result){
                    return callback(null, null, 200, null, result);
                }else{
                    return callback(1, 'invalid_user', 403, null, null);
                }
            }).catch(function(error){
                "use strict";
                return callback(1, 'find_one_user_fail', 400, error, null);
            });
        }catch(error){
            return callback(1, 'find_one_user_fail', 400, error, null);
        }
    },
    //findone : phải có catch
    authenticate: function (email, password, callback) {
        try {

            if (!Pieces.VariableBaseTypeChecking(password,'string')) {
                return callback(2, 'invalid_user_password', 422, 'password is not a string', null);
            }

            let where = { email: email };
            let attributes = ['id', 'userName','password', 'activated','isVerifyEmail', 'email', 'type'];
            User.findOne( {
                where: where,
                attributes: attributes}).then( account=>{
                "use strict";
                    if (account) {
                        if(account.isVerifyEmail === Constant.EMAIL_ACTIVATED.NO || account.activated === Constant.ACTIVATED.NO){
                            return callback(1, 'unactivated_user', 404, null, null);
                        }
                        else{
                            BCrypt.compare( password, account.password, function (error, result) {
                                console.log(BCrypt.compare( password, account.password));
                                if (result === true) {
                                    return callback(null, null, 200, null, account);
                                } else {
                                    return callback(1, 'wrong_password', 422, null, null);
                                }
                            });
                        }
                    } else {
                        return callback(1, 'invalid_user', 404, null, null);
                    }
                }).catch(function(error){
                "use strict";
                return callback(1, 'find_one_user_fail', 400, error, null);
            });
        }catch(error){
            return callback(2, 'authenticate_user_fail', 400, error, null);
        }
    },

    forget_pw: function( email,newPassword, callback){
        try {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)
            if ( !Pieces.VariableBaseTypeChecking(newPassword, 'string') ) {
                return callback(1, 'invalid_user_password', 400,'password is not a string', null);
            }
            else
            {
                newPass = BCrypt.hashSync(newPassword, 10);
            } 
           
            User.findOne({
                where: {email:email},
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if (result)
                {
                    const msg = {
                        to: `${email}`, // Change to your recipient
                        from: `${process.env.SENDGRID_SENDER}`, // Change to your verified sender
                        subject: "Account Verification",
                        // html: `<br><a href="http://toystrading.herokuapp.com/v1/change_pw/${result.dataValues.id}">CLICK ME TO CHANGE YOUR TOYSTRADE ACCOUNT PASSWORD</a>`
                        html: `<br><a href="http://toystrading.herokuapp.com/v1/change_pw?id=${result.dataValues.id}&newPassword=${newPass}">CLICK ME TO CHANGE YOUR TOYSTRADE ACCOUNT PASSWORD</a>`
                      }
                      sgMail.send(msg).then(() => {
                        console.log('Email sent')
                      }).catch((error) => {
                        console.error(error)
                      })
                }
                else
                {
                    return callback(2, 'email not exisits', 400, "", null);
                }     
                return callback(null, null, 200, null, result);
            }).catch(function(error){
                "use strict";
                return callback(1, 'create_user_fail', 400, error, null);
            });
        }catch(error){
            return callback(2, 'create_by_admin_user_fail', 400, error, null);
        }
    },

   
    create: function( userData, callback){
        try {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)

            User.findOne({
                where: {email:userData.email},
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if (result)
                {
                    return callback(2, 'email exisits', 400, "", null);
                }
                }).catch(function(error){
                    "use strict";
                    return callback(2, 'update_user_fail', 400, error, null);
                });

            User.findOne({
                where: {userName :userData.userName },
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if (result)
                {
                    return callback(2, 'username exisits', 400, "", null);
                }
                }).catch(function(error){
                    "use strict";
                    return callback(2, 'update_user_fail', 400, error, null);
                });
            User.findOne({
                where: {phone :userData.phone },
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if (result)
                {
                    return callback(2, 'phone exisits', 400, "", null);
                }
                }).catch(function(error){
                    "use strict";
                    return callback(2, 'update_user_fail', 400, error, null);
                });

            if ( !Pieces.VariableBaseTypeChecking(userData.userName, 'string')
                    || !Validator.isLength(userData.userName, {min: 4, max: 128}) ) {
                return callback(1, 'invalid_user_login_name', 400, 'login name should be alphanumeric, lowercase and length 4-128', null);
            }
            if ( !Pieces.VariableBaseTypeChecking(userData.password, 'string') ) {
                return callback(1, 'invalid_user_password', 400,'password is not a string', null);
            }

            if ( !Pieces.VariableBaseTypeChecking(userData.email, 'string')
                    || !Validator.isEmail(userData.email) ) {
                return callback(1, 'invalid_user_email', 400, 'email is incorrect format', null);
            }
    
            if ( !Validator.isLength(userData.phone, {min: 10, max: 11})) {
                return callback(1, 'invalid_user_phone', 400, 'phone is incorrect format (10->11)', null);              
            }
            

            let queryObj = {};

            queryObj.userName = userData.userName;
            queryObj.email = userData.email;
            queryObj.password = BCrypt.hashSync(userData.password, 10);
            queryObj.phone = userData.phone;
            queryObj.activated = 0;
            queryObj.ecoin = 200000;      
            User.create(queryObj).then(result=>{
                "use strict";
                const msg = {
                    to: `${userData.email}`, // Change to your recipient
                    from: `${process.env.SENDGRID_SENDER}`, // Change to your verified sender
                    subject: "Account Verification",
                    html: `<br><a href="http://toystrading.herokuapp.com/v1/verification/${result.dataValues.id}">CLICK ME TO ACTIVATE YOUR TOYSTRADE ACCOUNT</a>`
                  }
                  
                  sgMail.send(msg).then(() => {
                      console.log('Email sent')
                    }).catch((error) => {
                      console.error(error)
                    })
                return callback(null, 'Please check your Email', 200, null, result);
            }).catch(function(error){
                "use strict";
                return callback(1, 'create_user_fail', 400, error, null);
            });
        }catch(error){
            return callback(2, 'create_by_admin_user_fail', 400, error, null);
        }
    },

    change_pw: function(data , callback) {
        try {  
            let queryObj = {};
            queryObj.password =data.newPassword;          
            User.findOne({
                where: {id: data.id},
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                if (result)
                {             
                User.update(
                    queryObj,
                    {where: {id: data.id}}).then(result=>{
                        "use strict";
                        if( (result !== null) && (result.length > 0) && (result[0] > 0) ){
                            return callback(null, null, 200, null, data.id);
                        }else{
                            return callback(1, 'update_user_fail', 400, '', null);
                        }
                }).catch(function(error){
                    "use strict";
                    return callback(2, 'update_user_fail', 400, error, null);
                });
                }
                else
                {
                    return callback(2, 'user not found', 400, error, null);
                }
            }).catch(function(error){
                "use strict";
                return callback(3, 'user not found', 400, error, null);
            });
        }catch(error){
            return callback(4, 'get_one_account_fail', 400, error, null);
        }
    },
    signUP: function(accessUserId, accessUserType, id, callback) {
        try {
            let queryObj={};
            queryObj.isVerifyEmail = Constant.EMAIL_ACTIVATED.YES;
            queryObj.activated = Constant.ACTIVATED.YES;
            User.findOne({
                where: {id: id},
            }).then(result=>{// result kq trả về từ câu query 
                "use strict";
                User.update(
                    queryObj,
                    {where: {id: id}}).then(result=>{
                        "use strict";
                        if( (result !== null) && (result.length > 0) && (result[0] > 0) ){
                            return callback(null, 'Create user success', 200, null, id);
                        }else{
                            return callback(1, 'update_user_fail', 400, '', null);
                        }
                }).catch(function(error){
                    "use strict";
                    return callback(2, 'update_user_fail', 400, error, null);
                });
            }).catch(function(error){
                "use strict";
                return callback(3, 'user not found', 400, error, null);
            });
        }catch(error){
            return callback(4, 'get_one_account_fail', 400, error, null);
        }
    },

    // --------- others ----------
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
