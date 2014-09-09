var assert = require('assert');
var mongo = require('mongoskin');
var config = require('../../config/config.json')['test'];
var clog = require('../../custom_modules/companyLogic');
var dto = require('../../public/javascripts/app/dto');
var ObjectId = mongo.ObjectID;
var db;

var cid = ObjectId.createFromHexString('12345678901234567890ABCD');

describe('some feature', function () {
    before(function () {
        db = mongo.db(config.db_url, {native_parser: true});
    });

    after(function () {
        db.close();
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

    it('Should return two companies ordered by name', function (done) {
        clog.getAllCompanies(function (err, companies) {
            assert.equal(companies.length, 2, 'There should be only one company in database.');
            assert.equal(companies[0].name, 'company 1', 'The name should be the same.');
            assert.equal(companies[1].name, 'company 22', 'The name should be the same.');
            done();
        });
    });
    it('Should return two employees ordered by name', function (done) {
        clog.getAllEmployeesForCompany(cid.toString(), function (err, emp) {
            assert.equal(emp.length, 2, 'There should be only one company in database.');
            assert.equal(emp[0].name, 'aname 2', 'The name should be the same.');
            assert.equal(emp[1].name, 'bname 1', 'The name should be the same.');
            done();
        });
    });
    it('Should return three notes ordered by date', function (done) {
        clog.getAllNotesForOwner(cid.toString(), function (err, notes) {
            assert.equal(notes.length, 3, 'There should be only one company in database.');
            assert.equal(notes[0].text, 'message 1', 'The text should be the same.');
            assert.equal(notes[1].text, 'message 2', 'The text should be the same.');
            assert.equal(notes[2].text, 'message 3', 'The text should be the same.');
            done();
        });
    });
    it('Should return company', function (done) {
        clog.getCompanyDetails(cid.toString(), function (err, cmp) {
            assert.equal(cmp.name, 'company 1', 'The name should be the same.');
            assert.equal(cmp.url, 'url 1', 'The name should be the same.');
            done();
        });
    });
    it('Should remove company related notes and employees', function (done) {
        clog.deleteCompany(cid.toString(), function () {
            db.collection('companies').count(function (err, cnt) {
                assert.equal(cnt, 1, 'There should be 1 companies left');
                db.collection('notes').count(function (err, cnt) {
                    assert.equal(cnt, 2, 'There should be 2 notes left');
                    db.collection('employees').count(function (err, cnt) {
                        assert.equal(cnt, 1, 'There should be 1 employees left');
                        done();
                    });
                });
            });
        });
    });
    it('Should add one new company and one new employee and one new note', function (done) {
        var company = new dto.Company(undefined, 'company 3', 'url 3', new dto.Address('street 3', '55', '5', 'city 3'));
        company.employees.push(new dto.Employee(undefined, undefined, 'bname 1', 'title 1', 'phone 1', 'a@a.com'));
        company.notes.push(new dto.Note(undefined, undefined, new Date(), 'message 1'));
        clog.saveCompany(company, function (id) {
            db.collection('companies').count(function (err, cnt) {
                assert.equal(cnt, 3, 'There should be 3 companies');
                db.collection('notes').count(function (err, cnt) {
                    assert.equal(cnt, 6, 'There should be 6 notes');
                    db.collection('employees').count(function (err, cnt) {
                        assert.equal(cnt, 4, 'There should be 4 employees left');
                        done();
                    });
                });
            });
        });
    });
    it('Should update name of company and remove 1 employee and 2 notes', function (done) {
        clog.getCompanyDetails(cid.toString(), function (err, cmp) {
            var newName= 'new name';
            cmp.name = newName;
            var company = cmp;
            clog.getAllEmployeesForCompany(cid.toString(), function (err, emp) {
                emp[0]._destroy = 'Y';
                company.employees = emp;
                clog.getAllNotesForOwner(cid.toString(), function (err, notes) {
                    notes[0]._destroy = 'Y';
                    notes[2]._destroy = 'Y';
                    company.notes = notes;
                    clog.saveCompany(company, function (id) {
                        assert.equal(id.toString(), cid.toString(), 'Id should not change.');
                        db.collection('companies').findById(cid.toString(), function (err, cmp2) {
                            assert.equal(cmp2.name, newName, 'The nae should be changed');
                            db.collection('employees').find({companyId: id}).count(function (err, cnt) {
                                assert.equal(cnt, 1, '1 employee should left');
                                db.collection('notes').find({ownerId: id}).count(function (err, cnt) {
                                    assert.equal(cnt, 1, '1 note should left');
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });


});


