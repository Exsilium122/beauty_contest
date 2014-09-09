var db = require('../custom_modules/beautydb.js').db;
var ObjectId = require('../custom_modules/beautydb.js').ObjectID;
var DTO = require('../public/javascripts/app/dto.js');

exports.getAllCompanies = function(handler) {
    db.collection('companies').find().sort( {name : 1} ).toArray(handler);
};

exports.saveCompany = function(company, handler) {
    var notes = company.notes;
    var employees = company.employees;
    var processChildren;

    //convert string date into real date
    for (var i = 0; notes && i < notes.length; i++) {
        notes[i].date = new Date(notes[i].date);
    }

    //delete transient data
    delete company.notes;
    delete company.employees;
    delete company.isDirty;

    processChildren = function (handler, defaultParentId) {
        processArray(notes, 'notes', defaultParentId, function () {
            processArray(employees, 'employees', defaultParentId, handler);
        });
    };
    if(company._id) {
        var id = company._id;
        delete company._id;
        db.collection('companies').updateById(id, company, getErrorHandler(function() {
            processChildren(function() {
                handler(id);
            }, id);
        }));
    } else {
        db.collection('companies').insert(company, getErrorHandler(function(result) {
            var id = result[0]._id;
            processChildren(function() {
                handler(id);
            }, id);
        }));
    }
};

var processArray = function(arr, collection, defaultParentId, handler) {
    if(arr) {
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (item._destroy) {
                db.collection(collection).removeById(item._id, getErrorHandler());
            } else {
                delete item.isDirty;
                var ownerId = (item.companyId ? 'companyId' : (item.ownerId ? 'ownerId' : undefined));
                if(ownerId) {
                    if(typeof item[ownerId] === 'string') {
                        item[ownerId] = ObjectId.createFromHexString(item[ownerId]);
                    }
                } else if (collection === 'notes') {
                    item.ownerId = defaultParentId;
                } else if (collection === 'employees') {
                    item.companyId = defaultParentId;
                }
                if (item._id) {
                    var id = item._id;
                    delete item._id;
                    db.collection(collection).updateById(id, item, getErrorHandler());
                } else {
                    db.collection(collection).insert(item, getErrorHandler());
                }
            }
        }
    }
    if(handler) {
        handler();
    }
};

exports.deleteCompany = function(companyId, handler) {
    var id = ObjectId.createFromHexString(companyId);
    db.collection('notes').remove({ ownerId: id}, getErrorHandler());
    db.collection('employees').remove({ companyId: id}, getErrorHandler());
    db.collection('companies').remove({ _id: id}, getErrorHandler(function() {
        handler('Ok')
    }));
}

exports.getCompanyDetails = function(companyId, handler) {
    db.collection('companies').findById(companyId, handler);
}

exports.getAllEmployeesForCompany = function(companyId, handler) {
    var id = ObjectId.createFromHexString(companyId);
    db.collection('employees').find({ companyId : id }).sort( {name : 1} ).toArray(handler);
}

exports.getAllNotesForOwner = function(ownerId, handler) {
    var id = ObjectId.createFromHexString(ownerId);
    db.collection('notes').find({ ownerId : id }).sort( {date : 1} ).toArray(handler);
}

var getErrorHandler = function(handler) {
    return function(err, result) {
        if (err) {
            console.log(err)
            throw err;
        }
        if(handler) {
            handler(result);
        }
    }
}