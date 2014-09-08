var express = require('express');
var router = express.Router();
var DTO = require('../public/javascripts/app/dto.js');
var db = require('../custom_modules/beautydb.js').db;
var ObjectId = require('../custom_modules/beautydb.js').ObjectID;

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Beauty contest' });
});
//get plain version of homepage
router.get('/plain', function(req, res) {
    res.render('index_plain', { title: 'Beauty contest' });
});

    //get all companies from database
router.get('/company', function(req, res) {
    db.collection('companies').find().toArray(sendJson(res));
});

router.post('/company', function(req, res) {
    var company = req.body;
    var notes = company.notes;
    var employees = company.employees;

    //convert string date into real date
    for (var i=0; notes && i<notes.length; i++) {
        notes[i].date = new Date(notes[i].date);
    }
    delete company.notes;
    delete company.employees;
    delete company.isDirty;

    var id;
    if(company._id) {
        id = db.collection('companies').updateById({_id: ObjectId.createFromHexString(company._id)}, company, function(err, result) {
            if (err) throw err;
            res.send(company._id);
        });
    } else {
        id = db.collection('companies').insert(company, function(err, result) {
            if (err) throw err;
            res.send(result[0]._id);
        });
    }
    processArray(notes, 'notes');
    processArray(employees, 'employees');

});

var processArray = function(arr, collection) {
    for (var i=0; arr && i<arr.length; i++) {
        var item = arr[i];
        if(item._destroy) {
            db.collection(collection).remove({_id: ObjectId.createFromHexString(item._id)});
        } else {
            delete item.isDirty;
            if(item._id) {
                db.collection(collection).updateById({_id: ObjectId.createFromHexString(item._id)}, item, function(err, result) {
                    if (err) throw err;
                });
            } else {
                db.collection(collection).insert({_id: ObjectId.createFromHexString(item._id)}, item, function(err, result) {
                    if (err) throw err;
                });
            }
        }
    }
};

    //get one company
router.get('/company/:companyId', function(req, res) {
    var id = ObjectId.createFromHexString(req.params.companyId);
    db.collection('companies').findOne({ _id : id}, sendJson(res));
});

router.delete('/company/:companyId', function(req, res) {
    var id = ObjectId.createFromHexString(req.params.companyId);
    db.collection('companies').remove({ _id : id});
    db.collection('notes').remove({ ownerId : id});
    db.collection('employees').remove({ companyId : id});
    res.send('Ok');
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

var sendJson = function sendJson(res) {
    return function(err, result) {
        if (err) {
            console.error(err);
        } else {
            res.json(result);
        }
    }

}

module.exports = router;
