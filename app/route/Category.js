/*
 * Created by s3lab. on 1/13/2017.
 */
// our components
const CategoryCtrl = require('../controllers/CategoryCtrl');
module.exports = function (app) {
    app.post('/v1/auth/category', CategoryCtrl.create);
    app.get('/v1/auth/category', CategoryCtrl.getAll);
    app.get('/v1/auth/category/getCB', CategoryCtrl.getAllCB);
    app.put('/v1/auth/category/:id', CategoryCtrl.update);
    app.delete('/v1/auth/category/:id', CategoryCtrl.delete);
};
