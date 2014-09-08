var express = require('express');
var router = express.Router();
var clog = require('../custom_modules/companyLogic.js');

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
    clog.getAllCompanies(sendJson(res));
});

//save new company or update existing one
router.post('/company', function(req, res) {
    clog.saveCompany(req.body, function(result) {
        res.send(result);
    });
});

//get one company
router.get('/company/:companyId', function(req, res) {
    clog.getCompanyDetails(req.params.companyId, sendJson(res));
});

//delete company with related notes and employees
router.delete('/company/:companyId', function(req, res) {
    clog.deleteCompany(req.params.companyId, function(result) {
        res.send(result);
    });
});


//get employees for given company
router.get('/company/:companyId/employees', function(req, res) {
    clog.getAllEmployeesForCompany(req.params.companyId, sendJson(res));
});

//get notes for given owner
router.get('/notes/:ownerId', function(req, res) {
    clog.getAllNotesForOwner(req.params.ownerId, sendJson(res));
});

/**
 * Sends JSON response or logs error and throw it.
 */
var sendJson = function sendJson(res) {
    return function(err, result) {
        if (err) {
            console.error(err);
            throw err;
        } else {
            res.json(result);
        }
    }

}

module.exports = router;
