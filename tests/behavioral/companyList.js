var nodeenv = require('nodeenv');
nodeenv('NODE_ENV', 'test', function (done) {
});

var assert = require('assert');
var Browser = require('zombie');
var app = require('../../app');
var db = require('../../custom_modules/beautydb').db;
var ObjectId = require('../../custom_modules/beautydb').ObjectID;
var dto = require('../../public/javascripts/app/dto');
var server;
var cid = ObjectId.createFromHexString('12345678901234567890ABCD');

describe('Company', function () {
    before(function (done) {
        app.set('port', 3000);
        server = app.listen(app.get('port'), done);
    });

    after(function (done) {
        server.close(done);
    });



    beforeEach(function (done) {
        db.collection('companies').drop(function () {
            db.collection('notes').drop(function () {
                db.collection('employees').drop(function () {
                    var company = new dto.Company(cid, 'company 1', 'url 1', new dto.Address('street 1', '55', '5', 'city 1'));
                    delete company.employees;
                    delete company.notes;
                    db.collection('companies').insert(company, function (err, result) {
                        var id = result[0]._id;
                        db.collection('employees').insert(new dto.Employee(undefined, id, 'bname 1', 'title 1', 'phone 1', 'a@a.com'), function () {
                        });
                        db.collection('employees').insert(new dto.Employee(undefined, id, 'aname 2', 'title 2', 'phone 2', 'b@a.com'), function () {
                        });
                        db.collection('notes').insert(new dto.Note(undefined, id, new Date(), 'message 1'), function () {
                        });
                        db.collection('notes').insert(new dto.Note(undefined, id, new Date(), 'message 2'), function () {
                        });
                        db.collection('notes').insert(new dto.Note(undefined, id, new Date(), 'message 3'), function () {
                            var company2 = new dto.Company(ObjectId.createFromHexString('12345678901234567890ABC1'), 'company 22', 'url 22', new dto.Address('street 22', '55', '5', 'city 22'));
                            delete company2.employees;
                            delete company2.notes;
                            db.collection('companies').insert(company2, function (err, result) {
                                var id = result[0]._id;
                                db.collection('employees').insert(new dto.Employee(undefined, id, 'bname 22', 'title 22', 'phone 22', 'a@a.com'), function () {
                                });
                                db.collection('notes').insert(new dto.Note(undefined, id, new Date(), 'message 22'), function () {
                                });
                                db.collection('notes').insert(new dto.Note(undefined, id, new Date(), 'message 23'), function () {
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    describe('Company list', function () {
        it('Should load home page', function (done) {
            Browser.visit("http://localhost:3000/", function (err, browser) {
                assert.ok(browser.success, 'page loaded');
                done();
            });
        });
        it('Should start with two companies', function(done) {
            Browser.visit("http://localhost:3000/", function (err, browser) {
                assert.equal(browser.queryAll('#companyList tr').length, 2, 'There should be 2 companies on the list');
                done();
            });
        });
    });
});
