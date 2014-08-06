(function(exports){

//    if(typeof ko === 'undefined') {
//        var ko = {};
//        ko.observable = function(a) { return a };
//        ko.observableArray = function(a) { return a };
//    }

    exports.toKoAddress = function (address) {
        return new exports.Address(address.street, address.streetNo, address.apartmentNo, address.city);
    };
    exports.Address = function (street, streetNo, apartmentNo, city) {
        var self = this;
        self.street = ko.observable(street);
        self.streetNo = ko.observable(streetNo);
        self.apartmentNo = ko.observable(apartmentNo);
        self.city = ko.observable(city);
    };

    exports.toKoCompany = function (company) {
        return new exports.Company(company._id, company.name, company.url, exports.toKoAddress(company.address));
    }
    exports.Company = function (id, name, url, address) {
        var self = this;
        self._id = id;
        self.name = ko.observable(name);
        self.url = ko.observable(url);
        self.address = ko.observable(address || new exports.Address());
        self.employees = ko.observableArray();
        self.notes = ko.observableArray();
    };

    exports.toKoEmployee = function (emp) {
        return new exports.Employee(emp._id, emp.companyId, emp.name, emp.title, emp.phoneNo, emp.email);
    }
    exports.Employee = function (id, companyId, name, title, phoneNo, email) {
        var self = this;
        self._id = id;
        self.companyId = ko.observable(companyId);
        self.name = ko.observable(name);
        self.title = ko.observable(title);
        self.phoneNo = ko.observable(phoneNo);
        self.email = ko.observable(email);
    };

    exports.toKoNote = function (note) {
        return new exports.Note(note._id, note.ownerId, note.date, note.text);
    }
    exports.Note = function (id, ownerId, date, text) {
        var self = this;
        self._id = id;
        self.ownerId = ko.observable(ownerId);
        self.date = ko.observable(date);
        self.text = ko.observable(text);
    }

})(typeof exports === 'undefined'? this['DTO']={} : exports);

