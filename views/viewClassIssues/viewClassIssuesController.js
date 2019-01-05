angular.module("mainApp")
    .controller('viewClassIssuesController', ["$scope", "viewClassIssuesService", "crudService", function($scope, viewClassIssuesService, crudService){

        // controller initialization
        let self = this;
        self.snark = undefined;
        self.userTests = ["Nate", "Luke", "Kevin", "Antonio"];


        // CRUD functions and variables for filtering


        // contains returned rows from filter Query
        self.filteredQuery = [];
        // filters for the filterQuery service
        self.issueFilter = "";
        self.redemptionCodeFilter = "";
        self.bookFilter = "";
        self.classFilter = "";
        // variables for uib-typeahead
        // self.uibData = []

        // Make controller functions available as instance attribute
        self.filterQuery = filterQuery;
        self.deleteSelected = deleteSelected;
        self.saveSelected = saveSelected;
        // self.selectAllUib = selectAllUib;
        
        // accesses viewClasses service to query database
        function filterQuery() {

            let promise = viewClassIssuesService.filterQuery(self.issueFilter, self.redemptionCodeFilter, self.bookFilter, self.classFilter);
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
                    console.log("issue_ID to be deleted: " + keys[x]);
                    let promise = crudService.dbDelete('class_book_issues', 'issue_ID', keys[x]);
                    promises.push(promise);
                }
            }
            Promise.all(promises).then(function(affectedRows) {
                console.log(affectedRows);
                filterQuery();
                clearActive(); 
            });

        }


        // // function for getting data from external tables for uib-typeahead
        // function selectAllUib(tableName, desired) {
        //     console.log("uibSelectAll called");
        //     console.log("tableName: " + tableName);
        //     let promise = crudService.dbSelectAll(tableName, desired);
        //     promise.then(function(rows) {
        //         self.uibData = rows;
        //         console.log(uibData);
        //     });
        // }

        self.bookUpdateValid = true;
        self.classUpdateValid = true;

        // updates data tables (if valid) if the data has been changed from its previous state
        function saveSelected(row) {

            self.bookUpdateValid = true;
            self.classUpdateValid = true;

            let updatingBook = false;
            let updatingClass = false;

            // redemptionStatus is associated data, therefore just update the table
            if(self.activeRow.redemptionCode != row.redemptionCode) {
                var redemptionCodePromise = crudService.dbUpdate('class_book_issues', 'issue_ID', self.activeRow.issue_ID, self.activeRow);
            }

            // lookup modified primary data in respective table to see if it exists/is valid.
            if(self.activeRow.bookName != row.bookName) {
                var bookPromise = crudService.dbLookup(self.activeRow, 'books');
                updatingBook = true;
            }
            if(self.activeRow.className != row.className) {
                var classPromise = crudService.dbLookup(self.activeRow, 'classes');
                updatingClass = true;
            }
            
            
            Promise.all([bookPromise, classPromise, redemptionCodePromise])
            .then(function(values) {
                // values will be an array. Index is respective to the order in which the promises were resolved
                // even if dblookup returns error, still attempt to update-it will be rejected
                console.log(values);
                // error handling for the Primary data promises

                // if either of the primary data cells are being updated, wait for their promise(s) to be resolved
                if(updatingBook || updatingClass) {
                    if(updatingBook) {
                        if(values[0].length == 0) {
                            self.bookUpdateValid = false;
                        }
                        var bookUpdatePromise = crudService.dbUpdate('class_book_issues', 'issue_ID', self.activeRow.issue_ID, values[0][0]);
                    }
                    if(updatingClass) {
                        if(values[1].length == 0) {
                            self.classUpdateValid = false;
                        }
                        var classUpdatePromise = crudService.dbUpdate('class_book_issues', 'issue_ID', self.activeRow.issue_ID, values[1][0]);
                    }

                    Promise.all([bookUpdatePromise, classUpdatePromise])
                    .then(function(affectedRows){
                        console.log("affected" + affectedRows);
                        clearEditable();
                        filterQuery();
                    });
                }

                // if only redemptionCode updated locally
                else {
                    clearEditable();
                    filterQuery();
                }
                

            })
            .catch(function(errors) {
                console.log(errors);
                console.log("either updated className or updatedBookname were incorrect");
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
                default:
                    return '';
                    break;
            }

        }


        // variables that buttons reference when calling setSort()
        self.ssIssue_ID = 'issue_ID';
        self.ssRedemptionCode = 'redemptionCode';
        self.ssBookName = 'bookName';
        self.ssClassName = 'className';
        self.ssRedemptionStatus = 'redemptionStatus';

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

        self.changeEditable = changeEditable;
        self.clearEditable = clearEditable;

        self.changeSelectionStatus = changeSelectionStatus;
        self.changeSelectionStatusAll = changeSelectionStatusAll;
        self.anySelected = anySelected;
        self.allSelected = allSelected;
        self.allToggled = false;


        function getTemplate(row) {

            if(row.issue_ID === self.activeRow.issue_ID) {
                // if the edit button has been pressed within that row, return edit
                // this still will cause a digest, as scope variable changed
                if(self.activeRowEditable) return 'edit';

                // load "selected" if row has only been clicked on.
                return 'selected';
            }
            else {
                // otherwise default to displaying "display" template
                return 'display';
            }

        }


        // changes the editable status of the row to true
        function changeEditable() {
            self.activeRowEditable = true;
            self.editableRow = self.activeRow;
        }


        // removes the editable status of the row
        function clearEditable() {
            self.activeRowEditable = false;
            self.editableRow = {};
        }
        


        // changes the active row
        function changeActive(row) {

            // check to see whether a row is being edited or not
            if(!self.activeRowEditable){
                // create deep copy of the iterated object (row) from filteredQuery that is used for reference in getTemplate function
                // it is also used to save edited row data
                self.activeRow = angular.copy(row);
            }
            
        }


        // de-active the row
        function clearActive() {
            // check to see whether a row is being edited or not
            if(!self.activeRowEditable){
                // create deep copy of row that is used for reference in getTemplate function
                self.activeRow = {};
            }

        }


        // receives rows from filterQuery every time
        function initializeSelectedRows(rows) {
            for(var x=0; x<rows.length; x++) {
                self.selectedRows[rows[x].issue_ID] = false;
            }
        }


        // changes the selected row's status
        function changeSelectionStatus(row) {

            if(row.issue_ID != self.editableRow.issue_ID) {
                if(self.selectedRows[row.issue_ID] == true) {
                    self.selectedRows[row.issue_ID] = false;
                    self.allToggled = false;
                }
                else {
                    self.selectedRows[row.issue_ID] = true;
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




        // confirmation functions utilizing modal

        // receives action to determine confirmation completion
        // and item to insert custom objects to pull data from
        // function confirmAction(action, item) {
        //     switch(action) {
        //         case "save":

        //             let modalOptions = {
        //                 bodyText: "Change " + item.studentName + "'s name to " + self.selectedStudent.studentName + "?"
        //             }
        //             modalService.show({}, modalOptions).then(function(result) {
        //                 saveSelected();
        //             });

        //             break;

                
        //     }
        // }




        // initialization operations
        filterQuery();

    }]);