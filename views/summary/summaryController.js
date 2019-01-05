angular.module("mainApp")
    .controller('summaryController', ["$scope", "summaryService", "crudService", function($scope, summaryService, crudService){

         // controller initialization
        let self = this;



        // CRUD functions and variables for filtering


        // contains returned rows from filter Query
        self.filteredQuery = [];
        // Date controls
        self.startDate = '2018-11-24';
        self.endDate = '2018-11-31';
        // filter values for redeemedFilter
        self.rFilterYes = 'Yes';
        self.rFilterNo = 'No';
        self.rFilterNone = '';
        // variables for uib-typeahead
        // self.uibData = []

        // Make controller functions available as instance attribute
        self.filterQuery = filterQuery;
        // self.selectAllUib = selectAllUib;
        
        // accesses viewClasses service to query database
        function filterQuery() {

            let promise = summaryService.filterQuery(self.startDate, self.endDate);
            promise.then(function(rows){
                self.filteredQuery = rows;
                $scope.$apply();
            }).catch(function(rejection) {
                console.log(rejection);
            });
        }


        // field modification/template control functions
        self.activeRow = {};
        self.activeRowEditable = false;
        self.editableRow = {};
        self.selectedRows = {};

        self.getTemplate = getTemplate;
        self.changeActive = changeActive;
        self.clearActive = clearActive;


        function getTemplate(row) {

            if(row.redemption_ID === self.activeRow.redemption_ID) {
                // this is only kept here if special styles were to be added to the selected template (highlighting, effects, etc.)
                return 'selected';
            }
            else {
                // otherwise default to displaying "display" template
                return 'display';
            }

        }
        


        // changes the active row
        function changeActive(row) {

            self.activeRow = angular.copy(row);
            
        }
        
        // de-active the row
        function clearActive() {
            
            self.activeRow = {};

        }







        // initialization operations
        filterQuery();


    }]);