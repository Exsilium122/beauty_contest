var mirakel = mirakel || {};

mirakel.CompanyListModel = function() {
    /*DATA*/
    var self = this;
    self.companies = ko.mapping.fromJS([]);
    self.companyDetails = ko.mapping.fromJS(new DTO.Company(), mirakel.mappingClean);
    self.navigation = ko.observable('');
    self.ynModal = new YnModal();

    /*METHODS*/
    //remove company confirmation dialog
    self.removeCompanyQuestion = function (company) {
        self.ynModal.openModal(
            "Confirm company removal",
            "Do you want to remove "+company.name()+" company?",
            "Cancel",
            "Remove",
            function () { self.removeCompany(company) }
        );
    };
    //remove company
    self.removeCompany = function(company) {
        $.delete_('/company/'+company._id())
            .done(function() {
                self.companies.remove(company);
                toastr.info('Company deleted.');
            })
            .fail(function() {
               toastr.error('Connection problem occcured while deleting company.');
            });
    }

    //add new company
    self.addCompany = function() { self.goToDetail() };

    //save company
    self.saveCompanyDetails = function() {
        var pobj = mirakel.toJsWithDirtyFlag(self.companyDetails);
        pobj.notes = mirakel.arrayFilterChangedItems(pobj.notes);
        pobj.employees = mirakel.arrayFilterChangedItems(pobj.employees);
        $.post('/company', pobj)
            .done(function(companyId) {
                toastr.success("Company saved.");
                self.goToDetail({_id: companyId});
            })
            .fail(function() {
                toastr.error("Company was not saved, connection error. Please try again.");
            });
    };

    //cancel changes confirmation dialog
    self.cancelCompanyChangesQuestion = function() {
        self.ynModal.openModal(
            "Confirm cancellation of changes.",
            "Do you want to cancel all the changes?",
            "No",
            "Yes",
            self.cancelCompanyChanges
        );
    };
    //cancel changes
    self.cancelCompanyChanges = function() { window.history.back() };

    //add new employee
    self.addEmployee = function() {
        var emp = new DTO.Employee(undefined, self.companyDetails._id());
        var empObs = ko.mapping.fromJS(emp, mirakel.mappingDirty);
        self.companyDetails.employees.push(empObs);
        toastr.info("Empty employee added.");
    };

    //remove employee
    self.removeEmployee = mirakel.koArrayRemoveItemFunction(self.companyDetails.employees, "Employee was removed!");

    //add new note
    self.addNote = function() {
        var note = new DTO.Note(undefined, self.companyDetails._id());
        var noteObs = ko.mapping.fromJS(note, mirakel.mappingDirty);
        self.companyDetails.notes.push(noteObs);
        toastr.info("Empty note added.");
    };

    //remove note
    self.removeNote = mirakel.koArrayRemoveItemFunction(self.companyDetails.notes, "Note was removed!");

    /*REDIRECTIONS*/
    self.goToDetail = function(company) { location.hash = 'company/'+ ((company && company._id()) || 'new') };

    /*CLIENT SIDE NAVIGATION*/
    Sammy(function() {
        //list of all companies
        this.get('#company', function() {
            ko.mapping.fromJS(new DTO.Company(), self.companyDetails); //clear old company details so they will not blink before new data is loded
            self.navigation('list');
            $.get("/company")
                .done(function(data) {
                    ko.mapping.fromJS(data, self.companies);
                })
                .fail(function() {
                    toastr.error("Company list was not retrieved. Please try again.");
                });
        });
        //new company to be added
        this.get('#company/new', function() {
            $('#firstCompanyTab').tab('show');
            self.navigation('company');
            ko.mapping.fromJS(new DTO.Company(), self.companyDetails);
        });
        //display/edit existing company
        this.get('#company/:companyId', function() {
            $('#firstCompanyTab').tab('show');
            self.navigation('company');
            var companyId = this.params.companyId;
            //get core comany info
            $.getJSON("/company/"+companyId)
                .done(function(company) {
                    ko.mapping.fromJS(company, self.companyDetails);
                    //load employees in the background
                    $.getJSON('/company/'+companyId+'/employees')
                        .done(function(employees) {
                            ko.mapping.fromJS(employees, mirakel.mappingClean, self.companyDetails.employees);
                            mirakel.arrayResetDirty(self.companyDetails.employees());
                            //load notes in the background
                            $.getJSON('/notes/'+companyId)
                                .done(function(notes) {
                                    ko.mapping.fromJS(notes, mirakel.mappingClean, self.companyDetails.notes);
                                    mirakel.arrayResetDirty(self.companyDetails.notes());
                                    self.companyDetails.dirtyFlag.reset();
                            })
                            .fail(function() {
                                toastr.error("Notes list was not retrieved. Please try again.");
                            });
                    })
                    .fail(function() {
                        toastr.error("Employees list was not retrieved.. Please try again.");
                    });
                })
                .fail(function() {
                    toastr.error("Company details were not retrieved. Please try again.");
                });
        });
        this.get('', function() { this.app.runRoute('get', '#company') });
    }).run();


}

$('#companyTab a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
});

ko.applyBindings(new mirakel.CompanyListModel());

