const AssetCtrl = require('../controllers/AssetCtrl');
const upload = require("../middlewares/Upload");
module.exports = function (app) {
    app.post('/v1/auth/asset', AssetCtrl.create);  
    app.delete('/v1/auth/asset/:id', AssetCtrl.delete);
    app.post('/v1/auth/asset/del', AssetCtrl.del);
    app.get('/v1/auth/asset/:id', AssetCtrl.getAll);
};