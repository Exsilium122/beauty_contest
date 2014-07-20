function CompanyListModel() {
    //Data
    var self = this;
    self.companies = ko.observableArray();
    self.companyDetails = ko.mapping.fromJS(new DTO.Company());
    self.navigation = ko.observable();
    self.companyToBeRemoved;

    self.modalFunc;
    self.modal = ko.mapping.fromJS({
        title:'',
        message:'',
        cancelText:'',
        actionText:'',
        actionFunc: function() {
            if(self.modalFunc) self.modalFunc();
        }
    });

    //Methods
    self.removeCompanyQuestion = function(company) {
        self.companyToBeRemoved = company;
        self.openModal(
            "Confirm company removal",
            "Do you want to remove "+company.name+" company?",
            "Cancel",
            "Remove",
            self.removeCompany
            );
    };
    self.removeCompany = function() {
        self.companies.remove(self.companyToBeRemoved);
        //TODO remove from server
        self.companyToBeRemoved = undefined;
    }
    self.addCompany = function() { self.goToDetail() };
    self.saveCompanyDetails = function() {
        var pobj = ko.mapping.toJS(self.companyDetails);
        $.post('/company', pobj)
            .done(function() {
                alert( "second success" );
            })
            .fail(function() {
                alert( "error" );
            });
    };
    self.cancelCompanyChanges = function() { window.history.back() };

    //Redirections
    self.goToDetail = function(company) { location.hash = 'company/'+ ((company && company._id) || 'new') };

    //Client side navigation
    Sammy(function() {
        //list of all companies
        this.get('#company', function() {
            self.navigation('list');
            $.get("/company", {}, self.companies);
        });
        //new company to be added
        this.get('#company/new', function() {
            self.navigation('company');
            ko.mapping.fromJS(new DTO.Company(), self.companyDetails);
        });
        //display/edit existing company
        this.get('#company/:companyId', function() {
            self.navigation('company');
            var companyId = this.params.companyId;
            //get core comany info
            $.getJSON("/company/"+companyId, function(company) {
                ko.mapping.fromJS(company, self.companyDetails);
                //load employees in the background
                $.getJSON('/company/'+companyId+'/employees', function(employees) {
                    ko.utils.arrayForEach(employees, function (item) {
                        self.companyDetails.employees.push(ko.mapping.fromJS(item));
                    });
                });
                //load notes in the background
                $.getJSON('/notes/'+companyId, function(notes) {
                    ko.utils.arrayForEach(notes, function (item) {
                        self.companyDetails.notes.push(ko.mapping.fromJS(item));
                    });
                });
            });
        });
        this.get('', function() { this.app.runRoute('get', '#company') });
    }).run();

    //Util methods
    self.openModal = function(title, message, btnCancelText, btnActionText, actionFunc) {
        self.modal.title(title);
        self.modal.message(message);
        self.modal.cancelText(btnCancelText);
        self.modal.actionText(btnActionText);
        self.modalFunc=actionFunc;
        $('#yesNoModal').modal();
    };
}

$('#companyTab a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
});

ko.applyBindings(new CompanyListModel());

