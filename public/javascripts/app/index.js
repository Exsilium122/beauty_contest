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
    self.removeCompanyQuestion = function(company) {
        self.ynModal.openModal(
            "Confirm company removal",
            "Do you want to remove "+company.name()+" company?",
            "Cancel",
            "Remove",
            self.removeCompany(company)
        );
    };
    //remove company
    self.removeCompany = function(company) {
        return function () {
            self.companies.remove(company);
            //TODO remove from server
        };
    }

    //add new company
    self.addCompany = function() { self.goToDetail() };

    //save company
    self.saveCompanyDetails = function() {
        var pobj = mirakel.toJsWithDirtyFlag(self.companyDetails);
        pobj.notes = mirakel.arrayFilterChangedItems(pobj.notes);
        pobj.employees = mirakel.arrayFilterChangedItems(pobj.employees);
        $.post('/company', pobj)
            .done(function() {
                alert( "second success" );
            })
            .fail(function() {
                alert( "error" );
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
        self.companyDetails.employees.push(empObs)
    };

    //remove employee
    self.removeEmployee = mirakel.koArrayRemoveItemFunction(self.companyDetails.employees);

    //add new note
    self.addNote = function() {
        var note = new DTO.Note(undefined, self.companyDetails._id());
        var noteObs = ko.mapping.fromJS(note, mirakel.mappingDirty);
        self.companyDetails.notes.push(noteObs) };

    //remove note
    self.removeNote = mirakel.koArrayRemoveItemFunction(self.companyDetails.notes);

    /*REDIRECTIONS*/
    self.goToDetail = function(company) { location.hash = 'company/'+ ((company && company._id()) || 'new') };

    /*CLIENT SIDE NAVIGATION*/
    Sammy(function() {
        //list of all companies
        this.get('#company', function() {
            ko.mapping.fromJS(new DTO.Company(), self.companyDetails); //clear old company details so they will not blink before new data is loded
            self.navigation('list');
            $.get("/company", {}, function(data) {ko.mapping.fromJS(data, self.companies);} );
        });
        //new company to be added
        this.get('#company/new', function() {
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
                            });
                    });
                }
            );
        });
        this.get('', function() { this.app.runRoute('get', '#company') });
    }).run();


}

$('#companyTab a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
});
//TweenLite.set($('#animContent'), {perspective:700});

ko.applyBindings(new mirakel.CompanyListModel());

