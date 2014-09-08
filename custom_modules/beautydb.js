var mongo = require('mongoskin');
var config = require('../config/database.json');
exports.ObjectID = mongo.ObjectID;
exports.db = mongo.db(config.beautydb, {native_parser:true});
