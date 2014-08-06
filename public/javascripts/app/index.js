mirakel = {};
mirakel.CompanyListModel = function() {
    /*DATA*/
    var self = this;
    self.companies = ko.observableArray();
    self.companyDetails = ko.observable(new DTO.Company());
    self.navigation = ko.observable();

    self.ynModal = new YnModal();
    self.companyToBeRemoved;

    /*METHODS*/
    //remove company confirmation dialog
    self.removeCompanyQuestion = function(company) {
        self.companyToBeRemoved = company;
        self.ynModal.openModal(
            "Confirm company removal",
            "Do you want to remove "+company.name+" company?",
            "Cancel",
            "Remove",
            self.removeCompany
            );
    };
    //remove company
    self.removeCompany = function() {
        self.companies.remove(self.companyToBeRemoved);
        //TODO remove from server
        self.companyToBeRemoved = undefined;
    }

    //add new company
    self.addCompany = function() { self.goToDetail() };

    //save company
    self.saveCompanyDetails = function() {
        var pobj = ko.toJS(self.companyDetails());
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
    self.addEmployee = function() { self.companyDetails().employees.push(new DTO.Employee())};

    //remove employee
    self.removeEmployee = function(emp) { self.companyDetails().employees.remove(emp)};

    //add new note
    self.addNote = function() { self.companyDetails().notes.push(new DTO.Note()) };

    //remove note
    self.removeNote = function(note) { self.companyDetails().notes.remove(note) };

    /*REDIRECTIONS*/
    self.goToDetail = function(company) { location.hash = 'company/'+ ((company && company._id) || 'new') };

    /*CLIENT SIDE NAVIGATION*/
    Sammy(function() {
        //list of all companies
        this.get('#company', function() {
            self.navigation('list');
            self.companyDetails(new DTO.Company()); //clear old company details so they will not blink before new data is loded
            $.get("/company", {}, self.companies);
        });
        //new company to be added
        this.get('#company/new', function() {
            self.navigation('company');
            self.companyDetails(new DTO.Company());
        });
        //display/edit existing company
        this.get('#company/:companyId', function() {
            $('#firstCompanyTab').tab('show');
            self.navigation('company');
            var companyId = this.params.companyId;
            //get core comany info
            $.getJSON("/company/"+companyId)
                .done(function(company) {
                    self.companyDetails(DTO.toKoCompany(company));
                    //load employees in the background
                    $.getJSON('/company/'+companyId+'/employees')
                        .done(function(employees) {
                            ko.utils.arrayForEach(employees, function (item) {
                                self.companyDetails().employees.push(DTO.toKoEmployee(item));
                            });
                        }
                    );
                    //load notes in the background
                    $.getJSON('/notes/'+companyId)
                        .done(function(notes) {
                            ko.utils.arrayForEach(notes, function (item) {
                                self.companyDetails().notes.push(DTO.toKoNote(item));
                            });
                        }
                    );
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

ko.bindingHandlers.datePicker = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        // Register change callbacks to update the model
        // if the control changes.
        var picker = $(element);
        picker.datetimepicker();
        picker.on("dp.change",function (e) {
            var value = valueAccessor();
            value(picker.data("DateTimePicker").getDate().toDate());
        });
        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            picker.data("DateTimePicker").destroy();
        });
    },
    // Update the control whenever the view model changes
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value =  valueAccessor();
        var picker = $(element);
        picker.data("DateTimePicker").setDate(value());
    }
};

ko.applyBindings(new mirakel.CompanyListModel());
