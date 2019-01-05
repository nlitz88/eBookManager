angular.module("mainApp")
    .service("modalService", ["$uibModal", function($uibModal) {

        // attribute information for the instantiation of the MODAL (default)
        let modalDefaults = {
            backdrop: 'static',
            modalFade: true,
            templateUrl: __dirname + '/shared/components/modal.html'
        };

        // modal specific data that will be used within the scope (default)
        let modalOptions = {
            closeButtonText: 'cancel',
            actionButtonText: 'Yes',
            headerText: 'Confirm Action',
            bodyText: 'Are you sure?'
        };

        // inherits scope that it is defined in, allowing it to access variables like "modalDefaults"
        this.show = function(customModalDefaults, customModalOptions) {
            var tempModalDefaults = {};
            var tempModalOptions = {};

            // extend custom options and defaults over original into buffer/temp ones
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
            angular.extend(tempModalOptions, modalOptions, customModalOptions);

            // reference controllerAs attribute for modal instantiation
            tempModalDefaults.controllerAs = 'ctrl';

            // create controller for the modal
            tempModalDefaults.controller = function($scope, $uibModalInstance) {

                var self = this;

                self.confirm = confirm;
                self.dismiss = dismiss;
                self.modalOptions = tempModalOptions;

                function confirm(result) {
                    $uibModalInstance.close(result);
                }
                function dismiss(result) {
                    $uibModalInstance.dismiss('cancel');
                }

                // these functions resolve or reject the promise, therefore, there's no need to return "result". It's stored in this controller's scope

            }

            // once the options and defaults are sorted out, open a new modal with the options, referring to the controller, and return the promise from the open sequence
            return $uibModal.open(tempModalDefaults).result;

        }

    }]);