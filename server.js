/**
 * Created by s3lab. on 1/13/2017.
 */
// third party components
const Express = require('express');
const BodyParser = require('body-parser');
const MethodOverride = require('method-override');
const Morgan = require('morgan');

// our components
const Config = require('./app/config/Global');
const upload = require("./app/middlewares/Upload");
let App = Express();

global.CLOUD_API = {};
global.CLOUD_API.sAdminId = '';
global.CLOUD_API.anonymousId = '';
global.CLOUD_API.rootPath = __dirname;
global.CLOUD_API.Config = {};
//Tuan
global.__basedir = __dirname;
//Tuan
// log by using morgan
App.use(Morgan('combined'));

// get all data/stuff of the body (POST) parameters
// parse application/json
App.use(BodyParser.json({
    limit:'5mb'
}));

// parse application/vnd.api+json as json
App.use(BodyParser.json({
    type: 'application/vnd.api+json'
}));

// parse application/x-www-form-urlencoded
App.use(BodyParser.urlencoded({
    limit:'5mb',
    extended: true
}));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
App.use(MethodOverride('X-HTTP-Method-Override'));

App.all('/*', [require('./app/middlewares/AllowCrossDomain')]);

// Public Location
App.use(Express.static(global.CLOUD_API.rootPath + Config.paths.public));

// Auth Middleware - This will check if the token is valid
//App.all('/v1/auth/*',upload.single('image'), [require('./app/middlewares/ValidateRequest')]);
App.all('/v1/auth/*',upload.array('image',5), [require('./app/middlewares/ValidateRequest')]);

// Routes for API
require('./app/routes')(App); // configure our routes

// Create App
let server = require('http').createServer(App);

// Start Socket IO
require('./app/controllers/SocketCtrl').startSIO(server);

// Start App: http://IP_Address:port
const Port = parseInt(Config.port) + (process.env.NODE_APP_INSTANCE ? parseInt(process.env.NODE_APP_INSTANCE) : 0);
server.listen( Port, function () {
    console.log('API started to listening on port %d', `${Port}`);
});

const check_cronjob = require("./app/middlewares/CronJob")
const cron = require ("node-cron")
cron.schedule('00 01 00 * * *', function() {
    check_cronjob.checkDate(result => 
        {
            console.log(result)
        })
  });
// expose app
module.exports = App;
