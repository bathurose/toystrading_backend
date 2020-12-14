/*
 * Created by s3lab. on 1/13/2017.
 */
// our components
const ToyCtrl = require('../controllers/ToyCtrl');
const upload = require("../middlewares/Upload");
module.exports = function (app) {
    app.post('/v1/auth/toy', ToyCtrl.create);
    app.get('/v1/toy', ToyCtrl.getAll);
    app.get('/v1/get_new_toy', ToyCtrl.get_new_toy);
    app.put('/v1/auth/toy/:id', ToyCtrl.update);
    app.get('/v1/auth/toy/:id', ToyCtrl.getOne);
    app.delete('/v1/auth/toy/:id', ToyCtrl.delete);
};
