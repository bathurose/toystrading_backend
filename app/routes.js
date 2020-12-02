/**
 * Created by s3lab. on 1/13/2017.
 */
module.exports = function (app) {
    require('./route/User')(app);
    require('./route/Device')(app);
    require('./route/Service')(app);
    require('./route/Tag')(app);
    require('./route/Category')(app);
    require('./route/Asset')(app);
    require('./route/Toy')(app);
    require('./route/Transaction')(app);
    require('./route/Trans_Rate')(app);
};
