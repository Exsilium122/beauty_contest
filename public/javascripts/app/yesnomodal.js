function YnModal() {
    var self = this;
    self.actionFunc;
    self.title = ko.observable();
    self.message = ko.observable();
    self.cancelText = ko.observable();
    self.actionText = ko.observable();

    //Util methods
    self.openModal = function(title, message, btnCancelText, btnActionText, actionFunc) {
        self.title(title);
        self.message(message);
        self.cancelText(btnCancelText);
        self.actionText(btnActionText);
        self.actionFunc=actionFunc;
        $('#yesNoModal').modal();
    };
}