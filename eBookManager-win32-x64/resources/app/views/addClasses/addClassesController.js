angular.module("mainApp")
    .controller('addClassesController', ["$scope", "viewStudentsService", "addClassesService", "crudService", function($scope, viewStudentsService, addClassesService, crudService){
        console.log("hello from addClassesController initiation");

        // *** DECLARE VARIABLES AS NEEDED AS PER DOCUMENTATION
        // instead of exposing functions and variables of controller to $scope, contain them as attributes under the controller, almost like an object
        let self = this;
        // load uuid
        var short = require('short-uuid');
        var translator = short();


        // CRUD functions and variables for filtering


        // contains returned rows from filter Query
        self.filteredQuery = [];
        self.books = {};
        self.booksArray = [];
        // filters for the filterQuery service
        self.student_IDFilter = "";
        self.studentFilter = "";
        self.gradeFilter = "";
        // variables for uib-typeahead
        // self.uibData = []

        // Make controller functions available as instance attribute
        self.filterQuery = filterQuery;
        self.getBooks = getBooks;
        self.getSelected = getSelected;
        self.submitClass = submitClass;
        // self.selectAllUib = selectAllUib;
        
        // accesses viewClasses service to query database
        function filterQuery() {

            let promise = viewStudentsService.filterQuery(self.student_IDFilter, self.studentFilter, self.gradeFilter);
            promise.then(function(rows){
                self.filteredQuery = rows;
                initializeSelectedRows(self.filteredQuery);
                $scope.$apply();
            }).catch(function(rejection) {
                console.log(rejection);
            });
        }


        // gets books from bookTable
        function getBooks() {
            let promise = crudService.dbSelectAll('books', '*');
            promise.then(function(rows) {

                for(var x=0; x<rows.length; x++) {
                    // attribute bookName will have a book ID, bookName will be
                    self.books[rows[x].bookName] = rows[x].book_ID;
                    self.booksArray.push(rows[x].bookName);
                }

            }).catch(function(rejection) {
                console.log(rejection);
            });

        }



        function getDate() {
            var today = new Date();
            var yy = today.getFullYear();
            var mm = today.getMonth();
            var dd = today.getDate();

            if(dd<10) {
                dd = '0'+dd
            } 
            
            if(mm<10) {
                mm = '0'+mm
            } 

            today = yy + '-' + mm + '-' + dd
            return today;

        }


        
        // variables pertaining to the class submition
        self.redeeming = true;
        self.newClassName = "";
        self.classBookName = "Think and grow Rich";
        self.date = getDate();
        // self.checkedRows are the student ID's to be inserted


        function submitClass() {

            getSelected();

            let otherPromises = [];

            console.log("These should be the checked rows");
            console.log(self.checkedRows);

            let classPromise = crudService.dbInsert('classes', {className: self.newClassName});

            classPromise.then(function(affectedRows) {
               
               
                // lookup ID of new class
                let classIDPromise = crudService.dbLookup({className: self.newClassName}, 'classes');
                classIDPromise.then(function(class_ID) {

                    // begin inserting into the auxillary tables of class_students and class_book_issues
                    for(var x=0; x<self.checkedRows.length; x++) {
                    
                        let classStudentsPromise = crudService.dbInsert('class_students', {class_ID: class_ID[0].class_ID, student_ID: self.checkedRows[x]});
                        console.log(class_ID[0].class_ID + " " + self.checkedRows[x]);
                        otherPromises.push(classStudentsPromise);

                        var uuidCode = translator.new(); // generate uuid code here


                        let classBookIssuePromise = crudService.dbInsert('class_book_issues', {book_ID: self.books[self.classBookName], redemptionCode: uuidCode, class_ID: class_ID[0].class_ID});
                        console.log(self.books[self.classBookName] + " " + class_ID[0].class_ID);
                        otherPromises.push(classBookIssuePromise);


                    }
                    Promise.all(otherPromises).then(function(affectedRows) {

                        console.log(self.checkedRows);
                        
                        let issueLookupPromises = [];

                        // once the two class tables are updated, then insert data into redemptions table
                        // due to time contraints, redeeming instantly was the only way of assuring that redemptions were put through
                        if(self.redeeming) {

                            for(var i=0; i<self.checkedRows.length; i++) {
                                console.log("loop " + i);
                            // lookup the issue_ID given the redemption code
                                let issueLookupPromise = crudService.dbLookup({redemptionCode: uuidCode}, 'class_book_issues');
                                issueLookupPromises.push(issueLookupPromise);

                            }

                            // once all of the issue Id lookups have been completed, they will be returned as an ordered array
                            Promise.all(issueLookupPromises).then(function(issue_IDS) {

                                let redemptionPromises = [];

                                console.log(issue_IDS);

                                for(var x=0; x<issue_IDS.length; x++) {
                                    console.log("Issue_ID " + issue_IDS[x][0].issue_ID);
                                    let redemptionPromise = crudService.dbInsert('redemptions', {student_ID: self.checkedRows[x], issue_ID: issue_IDS[x][0].issue_ID, book_ID: self.books[self.classBookName], class_ID: class_ID[0].class_ID, date: self.date});
                                    redemptionPromises.push(redemptionPromise);
                                }

                                Promise.all(redemptionPromises).then(function(affectedRows) {
                                    console.log(affectedRows);
                                    console.log("Success");

                                    // reset all variables and values
                                    self.student_IDFilter = "";
                                    self.studentFilter = "";
                                    self.gradeFilter = "";
                                    self.activeRow = {};
                                    initializeSelectedRows(self.filteredQuery);
                                    self.checkRows = [];
                                    self.newClassName = "";
                                    self.classBookName = "Think and grow Rich";


                                }).catch(function(errors) {
                                    console.log(errors);
                                })

                                    // let redemptionPromise = crudService.dbInsert('redemptions', {student_ID: self.checkedRows[i], issue_ID: issue_ID[0].issue_ID, book_ID: self.books[self.classBookName], class_ID: class_ID[0].class_ID, date: self.date});
                                    
                                    // console.log("X: " + i + self.checkedRows[i] + " " + issue_ID[0].issue_ID + " " + self.books[self.classBookName]+ " " +  class_ID[0].class_ID + " " + self.date);

                                    // redemptionPromise.then(function(affectedRows) {
                                    //     console.log(affectedRows);
                                    // }).catch(function(error) {
                                    //     console.log(error);
                                    // })


                            });


                            
                        }



                    });


                });




                
                


            });
            // for selected students

            
            

            // insert class_ID, Student_ID in class_students
            // insert book_ID, a uuid redemptionCode, and class_ID
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
                case "student_ID":
                    return orderModifier + 'student_ID';
                    break;
            }

        }


        // variables that buttons reference when calling setSort()
        self.ssStudentName = 'studentName';
        self.ssGrade = 'grade';
        self.ssStudent_ID = 'student_ID';

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

        self.checkRows = [];

        self.getTemplate = getTemplate;
        self.changeActive = changeActive;
        self.clearActive = clearActive;

        self.changeSelectionStatus = changeSelectionStatus;
        self.changeSelectionStatusAll = changeSelectionStatusAll;
        self.anySelected = anySelected;
        self.allSelected = allSelected;
        self.allToggled = false;


        function getTemplate(row) {

            if(row.student_ID === self.activeRow.student_ID) {

                // load "selected" if row has only been clicked on.
                return 'selected';
            }
            else {
                // otherwise default to displaying "display" template
                return 'display';
            }

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
                self.selectedRows[rows[x].student_ID] = false;
            }
        }


        // changes the selected row's status
        function changeSelectionStatus(row) {

                if(self.selectedRows[row.student_ID] == true) {
                    self.selectedRows[row.student_ID] = false;
                    self.allToggled = false;
                }
                
                else {
                    self.selectedRows[row.student_ID] = true;
                    if(allSelected()) self.allToggled = true;
                }
                
                // console.log(self.selectedRows);

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


        self.checkedRows = [];
        function getSelected() {
            var keys = Object.keys(self.selectedRows);
            for(var x=0; x<Object.keys(self.selectedRows).length; x++) {
                //console.log(self.selectedRows[keys[x]]);
                if(self.selectedRows[keys[x]]) {
                    self.checkedRows.push(keys[x])
                }
            }
            console.log(self.checkedRows);
        }



        // initialization operations
        getBooks();
        filterQuery();




    }]);