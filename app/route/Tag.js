/*
 * Created by s3lab. on 1/13/2017.
 */
// our components
const TagCtrl = require('../controllers/TagCtrl');
const Tag = require('../models/Tag');
module.exports = function (app) {
    app.post('/v1/auth/tag', TagCtrl.create);
    app.get('/v1/tag', TagCtrl.getAll);
    app.put('/v1/auth/tag/:id', TagCtrl.update);
    app.delete('/v1/auth/tag/:id', TagCtrl.delete);
};
