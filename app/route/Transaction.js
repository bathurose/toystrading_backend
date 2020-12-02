/*
 * Created by s3lab. on 1/13/2017.
 */
// our components
const TransactionCtrl = require('../controllers/TransactionCtrl');
const Transaction = require('../models/Transaction');

module.exports = function (app) {
    app.post('/v1/auth/transaction', TransactionCtrl.create);
    app.get('/v1/auth/transaction', TransactionCtrl.getAll);
    app.get('/v1/auth/transaction/req', TransactionCtrl.getAllByUser);
    app.put('/v1/auth/transaction/:id', TransactionCtrl.update);
};
