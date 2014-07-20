(function(exports){

    exports.Address = function (street, streetNo, apartmentNo, city) {
        var self = this;
        self.street = street;
        self.streetNo = streetNo;
        self.apartmentNo = apartmentNo;
        self.city = city;

    };

    exports.Company = function (id, name, url, address) {
        var self = this;
        self._id = id;
        self.name = name;
        self.url = url;
        self.address = address || new exports.Address();
        self.employees = [];
        self.notes = [];
    };

    exports.Employee = function (id, companyId, name, title, phoneNo, email) {
        var self = this;
        self._id = id;
        self.companyId = companyId;
        self.name = name;
        self.title = title;
        self.phoneNo = phoneNo;
        self.email = email;
    };

    exports.Note = function (id, ownerId, date, text) {
        var self = this;
        self._id = id;
        self.ownerId = ownerId;
        self.date = date;
        self.text = text;
    }

})(typeof exports === 'undefined'? this['DTO']={} : exports);

