var express = require('express');
var router = express.Router();
var DTO = require('../public/javascripts/app/dto.js');
var db = require('../custom_modules/beautydb.js').db;
var ObjectId = require('../custom_modules/beautydb.js').ObjectID;

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Beauty contest' });
});

    //get all companies from database
router.get('/company', function(req, res) {
    db.collection('companies').find().toArray(sendJson(res));
});

router.post('/company', function(req, res) {
//        var result = db.collection('companies').save(req.body);
//        res.json(result);
        res.json(req.body);
});

    //get one company
router.get('/company/:companyId', function(req, res) {
    var id = ObjectId.createFromHexString(req.params.companyId);
    db.collection('companies').findOne({ _id : id}, sendJson(res));
});


    //get employees for given company
router.get('/company/:companyId/employees', function(req, res) {
    var id = ObjectId.createFromHexString(req.params.companyId);
    db.collection('employees').find({ companyId:id}).toArray(sendJson(res));
});

    //get notes for given owner
router.get('/notes/:ownerId', function(req, res) {
    var id = ObjectId.createFromHexString(req.params.ownerId);
    db.collection('notes').find({ ownerId:id}).toArray(sendJson(res));
});

var sendJson = function(res) {
    return function(err, result) {
        if (err) {
            console.error(err);
        } else {
            res.json(result);
        }
    }

}

module.exports = router;
