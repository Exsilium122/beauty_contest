var app = require('../app');
var mongo = require('mongoskin');
var config = require('../config/config.json')[app.get('env')];
exports.ObjectID = mongo.ObjectID;
exports.db = mongo.db(config.db_url, {native_parser:true});
