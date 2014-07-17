function CompanyListModel() {
    //Data
    var self = this;
    var id = 1;
    self.companies = ko.observableArray();
    self.companyDetails = ko.observable();

    //Methods
    self.removeCompany = function(company) { self.companies.remove(company); };
    self.addCompany = function() { self.goToDetail() };

    //Redirections
    self.goToDetail = function(company) { location.hash = 'company/'+ ((company && company.id) || 'new') };

    //Client side navigation
    Sammy(function() {
        this.get('#company', function() {
            self.companyDetails(null);
            $.get("/company", {}, self.companies);
        });
        this.get('#company/new', function() {
            self.companies(null);
            self.companyDetails(ko.mapping.fromJS(new DTO.CompanyDetails()));
        });
        this.get('#company/:companyId', function() {
            self.companies(null);
            $.get("/company", { companyId: this.params.companyId }, self.companyDetails);
        });
        this.get('', function() { this.app.runRoute('get', '#company') });
    }).run();
}

ko.applyBindings(new CompanyListModel());