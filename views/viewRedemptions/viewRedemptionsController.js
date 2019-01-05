angular.module("mainApp")
    .controller('viewRedemptionsController', ["$scope", "viewRedemptionsService", "crudService", function($scope, viewRedemptionsService, crudService){

         // controller initialization
        let self = this;



        // CRUD functions and variables for filtering


        // contains returned rows from filter Query
        self.filteredQuery = [];
        // filters for the filterQuery service
        self.studentFilter = "";
        self.gradeFilter = "";
        self.issueFilter = "";
        self.redemptionCodeFilter = "";
        self.bookFilter = "";
        self.classFilter = "";
        self.dateFilter = "";
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
        self.deleteSelected = deleteSelected;
        // self.selectAllUib = selectAllUib;
        
        // accesses viewClasses service to query database
        function filterQuery() {

            let promise = viewRedemptionsService.filterQuery(self.studentFilter, self.gradeFilter, self.issueFilter, self.redemptionCodeFilter, self.bookFilter, self.classFilter, self.dateFilter, self.startDate, self.endDate);
            promise.then(function(rows){
                self.filteredQuery = rows;
                initializeSelectedRows(self.filteredQuery);
                $scope.$apply();
            }).catch(function(rejection) {
                console.log(rejection);
            });
        }


        function deleteSelected() {

            var keys = Object.keys(self.selectedRows);
            var promises = [];
            for(var x=0; x<Object.keys(self.selectedRows).length; x++) {
                // if the rows are selected
                if(self.selectedRows[keys[x]]) {
                    console.log("redemption_ID to be deleted: " + keys[x]);
                    let promise = crudService.dbDelete('redemptions', 'redemption_ID', keys[x]);
                    promises.push(promise);
                }
            }
            Promise.all(promises).then(function(affectedRows) {
                console.log(affectedRows);
                filterQuery();
                clearActive(); 
            });

        }





        // sort functions and variables
        self.sortBy = "";
        self.sortReversed = false;

        self.getSortBy = getSortBy;

        // returns expression for "orderBy" in ng-repeat
        // this function will run if setSort changes a scope variable, as ng-digest will run
        function getSortBy() {

            let orderModifier = "";
            if(self.sortReversed) orderModifier = "-";

            switch(self.sortType) {
                case "studentName":
                    return orderModifier + 'studentName';
                    break;
                case "grade":
                    return orderModifier + 'grade';
                    break;
                case "issue_ID":
                    return orderModifier + 'issue_ID';
                    break;
                case "redemptionCode":
                    return orderModifier + 'redemptionCode';
                    break;
                case "bookName":
                    return orderModifier + 'bookName';
                    break;
                case "className":
                    return orderModifier + 'className';
                    break;
                case "date":
                    return orderModifier + 'date';
                    break;
                default:
                    return '';
                    break;
            }

        }


        // variables that buttons reference when calling setSort()
        self.ssStudentName = 'studentName';
        self.ssGrade = 'grade';
        self.ssIssue = 'issue_ID';
        self.ssRedemptionCode = 'redemptionCode';
        self.ssBook = 'bookName';
        self.ssClassName = 'className';
        self.ssDate = 'date';

        self.setSort = setSort;

        // sets sortType and sortReversed from modifying buttons
        function setSort(type) {
            console.log(type);
            // if sort type has changed, then reset the state of the button
            if(self.sortType != type) {
                self.sortReversed = false;
                console.log("type changed resetting reversed");
            }
            // otherwise, just reverse the state to the opposite direction
            else {
                if(self.sortReversed) self.sortReversed = false;
                else if(!self.sortReversed) self.sortReversed = true;
            }
            // set sort type, this should trigger a digest, thus calling getSortBy() again
            self.sortType = type;
            // switch sort direction based on previous state
        }

        





        // field modification/template control functions
        self.activeRow = {};
        self.activeRowEditable = false;
        self.editableRow = {};
        self.selectedRows = {};

        self.getTemplate = getTemplate;
        self.changeActive = changeActive;
        self.clearActive = clearActive;

        self.changeSelectionStatus = changeSelectionStatus;
        self.changeSelectionStatusAll = changeSelectionStatusAll;
        self.anySelected = anySelected;
        self.allSelected = allSelected;
        self.allToggled = false;


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





        // row selection functions
        
        // receives rows from filterQuery every time
        function initializeSelectedRows(rows) {
            for(var x=0; x<rows.length; x++) {
                self.selectedRows[rows[x].redemption_ID] = false;
            }
        }


        // changes the selected row's status
        function changeSelectionStatus(row) {

            if(row.redemption_ID != self.editableRow.redemption_ID) {
                if(self.selectedRows[row.redemption_ID] == true) {
                    self.selectedRows[row.redemption_ID] = false;
                    self.allToggled = false;
                }
                else {
                    self.selectedRows[row.redemption_ID] = true;
                    if(allSelected()) self.allToggled = true;
                }
                
                // console.log(self.selectedRows);
            }

        }


        // toggles all rows as either selected or not selected
        function changeSelectionStatusAll() {

            var keys = Object.keys(self.selectedRows);

            if(self.allToggled) {
                for(var x=0; x<Object.keys(self.selectedRows).length; x++) {
                    self.selectedRows[keys[x]] = false;
                }
            }
            else {
                for(var x=0; x<Object.keys(self.selectedRows).length; x++) {
                    self.selectedRows[keys[x]] = true;
                }
            }
        }


        // returns whether or not all of the rows are selected
        function allSelected() {

            var allTrue;
            var keys = Object.keys(self.selectedRows);
            for(var x=0; x<Object.keys(self.selectedRows).length; x++) {
                // console.log(self.selectedRows[keys[x]]);
                if(self.selectedRows[keys[x]] == false) {allTrue = false; break;}
                else {allTrue = true;}
            }
            if(!allTrue) return false;
            else return true;
            
        }
 

        // determines whether or not any of the rows are selected
        function anySelected() {
                var result;
                var keys = Object.keys(self.selectedRows);
                for(var x=0; x<Object.keys(self.selectedRows).length; x++) {
                    //console.log(self.selectedRows[keys[x]]);
                    if(self.selectedRows[keys[x]]) {result = true; break;}
                }
                if(result) return true;
                else return false;
        }






        // initialization operations
        filterQuery();


    }]);