const Sequelize = require('sequelize');
const Models = require('../models');
const Transaction = Models.Transaction;
const Toy = Models.Toy;
const User = Models.User;

module.exports = {
    checkDate :function (callback){
    try {
            let id_result = [];
            let where={};
            where.status='REQUEST';
            Transaction.findAll({
                    where: where, 
                }).then((trans) => {
                    for (let i =0; i<trans.length;i++)
                    {
                        var cur_date = new Date();
                        cur_date.setDate(cur_date.getDate()-4);
                        if (cur_date.getDate()===trans[i].dataValues.updatedAt.getDate())
                        {
                            Transaction.update(
                                {status:"DONE"},
                                {where: {id:trans[i].dataValues.id}}).then(result=>{
                                    "use strict"                    
                            }).catch(function(error){
                                "use strict";
                                return callback(2, 'update_transaction_fail', 400, error, null);
                            });
                            Transaction.findOne(
                                {where: id=trans[i].dataValues.id}).then(result=>{
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
                                                        ecoin:buyer.dataValues.ecoin-toy.dataValues.ecoin},
                                                        {where: {id:result.dataValues.buyer}
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
                                                        ecoin:seller.dataValues.ecoin+toy.dataValues.ecoin},
                                                        {where: {id:result.dataValues.seller}
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
                                    },
                                    {
                                        where: {id:result.dataValues.toyid}
                                    }
                                    ).then(toy=>{  
                                        "use strict";                            
                                    }).catch(function(error){
                                        "use strict";
                                        return callback(2, 'delete_toy_fail', 400, error, null);
                                });                       
                            }).catch(function(error){
                                "use strict";
                                return callback(1, 'update_transaction_fail', 400, error, null);
                            });
                            id_result[i]=trans[i].dataValues.id
                        }
                        
                    } 
                    return callback(null, null, 200, null, id_result.toString());                                     
                }).catch(function (error) {
                    return callback(1, 'get_transaction_fail', 420, error, null);
                });
            }    
    catch(error){
        return callback(2, 'get_transaction_fail', 400, error, null);
    }
    }
};