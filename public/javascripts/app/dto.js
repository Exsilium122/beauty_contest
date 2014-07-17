(function(exports){

    exports.Address = function (street, streetNo, apartmentNo, city) {
        var self = this;
        self.street = street;
        self.streetNo = streetNo;
        self.apartmentNo = apartmentNo;
        self.city = city;

    };

    exports.Company = function (id, name, city, phone) {
        var self = this;
        self.id = id;
        self.name = name;
        self.city = city;
        self.phone = phone;
    };

    exports.CompanyDetails = function (id, name, address, employees) {
        var self = this;
        self.id = id;
        self.name = name;
        self.address = address || new exports.Address();
        self.employees = employees || [];
    };

})(typeof exports === 'undefined'? this['DTO']={}: exports);

