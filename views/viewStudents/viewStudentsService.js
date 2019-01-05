// knex initialization lives here, as viewClasses is the default view of the app
// and this service is therefore initialized first

var knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: __dirname + "/bookManager.db"
    }
});


angular.module("mainApp")
    .service("viewStudentsService", function() {
        
        return {
            filterQuery: filterQuery
        }

        // functions for viewing class students

        function filterQuery(student_IDFilter, studentFilter, gradeFilter) {

            let promise = knex('students')

                .select(
                    'students.student_ID',
                    'students.studentName',
                    'students.grade'
                    )
                .where('students.studentName', 'like', '%' + studentFilter + '%')
                .andWhere('students.grade', 'like', gradeFilter + '%')
                .andWhere('students.student_ID', 'like', student_IDFilter + '%')
                
            return promise;
        }

        

        // functions for viewing class book issues

    });