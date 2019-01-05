angular.module("mainApp")
    .controller('viewClassStudentsController', ["$scope", "viewClassStudentsService", "crudService", function($scope, viewClassStudentsService, crudService){

        // controller initialization
        let self = this;



        // CRUD functions and variables for filtering


        // contains returned rows from filter Query
        self.filteredQuery = [];
        // filters for the filterQuery service
        self.classFilter = "";
        self.studentFilter = "";
        self.gradeFilter = "";
        // variables for uib-typeahead
        // self.uibData = []

        // Make controller functions available as instance attribute
        self.filterQuery = filterQuery;
        self.deleteSelected = deleteSelected;
        self.saveSelected = saveSelected;
        // self.selectAllUib = selectAllUib;
        
        // accesses viewClasses service to query database
        function filterQuery() {

            let promise = viewClassStudentsService.filterQuery(self.classFilter, self.studentFilter, self.gradeFilter);
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
                    console.log("class_student_ID to be deleted: " + keys[x]);
                    let promise = crudService.dbDelete('class_students', 'class_student_ID', keys[x]);
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

        self.studentUpdateValid = true;
        self.classUpdateValid = true;

        // updates data tables (if valid) if the data has been changed from its previous state
        function saveSelected(row) {

            self.studentUpdateValid = true;
            self.classUpdateValid = true;

            let updatingClass = false;
            let updatingStudent = false;
            // lookup modified primary data in respective table to see if it exists/is valid.
            if(self.activeRow.studentName != row.studentName) {
                var studentPromise = crudService.dbLookup(self.activeRow, 'students');
                updatingStudent = true;
            }
            if(self.activeRow.className != row.className) {
                var classPromise = crudService.dbLookup(self.activeRow, 'classes');
                updatingClass = true;
            }
            
            Promise.all([studentPromise, classPromise])
            .then(function(values) {
                // values will be an array. Index is respective to the order in which the promises were resolved
                // even if dblookup returns error, still attempt to update-it will be rejected
                //console.log(values);
                // error handling for the Primary data promises

                // if either of the primary data cells are being updated, wait for their promise(s) to be resolved
                if(updatingStudent || updatingClass) {
                    if(updatingStudent) {
                        if(values[0].length == 0) {
                            self.studentUpdateValid = false;
                        }
                        var studentUpdatePromise = crudService.dbUpdate('class_students', 'class_student_ID', self.activeRow.class_student_ID, values[0][0]);
                    }
                    if(updatingClass) {
                        if(values[1].length == 0) {
                            self.classUpdateValid = false;
                        }
                        var classUpdatePromise = crudService.dbUpdate('class_students', 'class_student_ID', self.activeRow.class_student_ID, values[1][0]);
                    }

                    Promise.all([studentUpdatePromise, classUpdatePromise])
                    .then(function(affectedRows){
                        console.log(affectedRows);
                        clearEditable();
                        filterQuery();
                    });
                }

                
                else {
                    clearEditable();
                    filterQuery();
                }
                

            })
            .catch(function(errors) {
                console.log(errors);
                console.log("either updated className or updatedStudentname were incorrect. Maybe I'll return as an array");
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
                case "className":
                    return orderModifier + 'className';
                    break;
                case "studentName":
                    return orderModifier + 'studentName';
                    break;
                case "grade":
                    return orderModifier + 'grade';
                    break;
                default:
                    return '';
                    break;
            }

        }


        // variables that buttons reference when calling setSort()
        self.ssClassName = 'className';
        self.ssStudentName = 'studentName';
        self.ssGrade = 'grade';

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

            if(row.class_student_ID === self.activeRow.class_student_ID) {
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
                self.selectedRows[rows[x].class_student_ID] = false;
            }
        }


        // changes the selected row's status
        function changeSelectionStatus(row) {

            if(row.class_student_ID != self.editableRow.class_student_ID) {
                if(self.selectedRows[row.class_student_ID] == true) {
                    self.selectedRows[row.class_student_ID] = false;
                    self.allToggled = false;
                }
                else {
                    self.selectedRows[row.class_student_ID] = true;
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