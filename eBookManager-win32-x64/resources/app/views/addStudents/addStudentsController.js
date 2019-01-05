angular.module("mainApp")
    .controller('addStudentsController', ["$scope", "crudService", function($scope, crudService) {

        
        // instead of exposing functions and variables of controller to $scope, contain them as attributes under the controller, almost like an object
        let self = this;


        // variables for formbuilding
        self.fields = [{studentName: "", grade: ""}];
        // functions controlling the formbuilding
        self.addField = addField;
        self.submitFields = submitFields;
        self.removeField = removeField;


        function addField() {
            
            let newField = {
                studentName: "",
                grade: ""
            };

            self.fields.push(newField);

        }



        function submitFields() {
            
            console.log("form being submitted");
            for(field in self.fields) {
                let fieldPromise = crudService.dbInsertStudents(self.fields[field]);
                fieldPromise.then(function(affected){
                    // FOR SOME REASON, INSERTING A STRING INTO AN INTEGER COLUMN DOESN'T CAUSE AN ERROR!!!!
                    console.log(affected);
                    // then display students, using filterText just in case there is filter text in place
                });
            }
            // once rows have been inserted to db, remove all fields and reset to initial single value
            clearStudentFields();
        }



        function removeField(field) {
            let idx = self.fields.indexOf(field);
            self.fields.splice(idx, 1);
        }



        function clearStudentFields() {
            self.fields = [{name: "", grade: ""}];
        }



    }]);