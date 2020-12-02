/*
 * Created by s3lab. on 1/13/2017.
 */
// our components
const Trans_Rate_Ctrl = require('../controllers/Trans_Rate_Ctrl');

module.exports = function (app) {
    app.post('/v1/auth/transrate', Trans_Rate_Ctrl.create);
    // app.get('/v1/auth/toy', ToyCtrl.getAll);
    // app.put('/v1/auth/toy/:id', ToyCtrl.update);
    // app.get('/v1/auth/toy/:id', ToyCtrl.getOne);
    // app.delete('/v1/auth/toy/:id', ToyCtrl.delete);
};
