var mongo = require('mongoskin');
exports.ObjectID = mongo.ObjectID;
exports.db = mongo.db("mongodb://localhost:27017/beauty", {native_parser:true});
