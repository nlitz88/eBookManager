// knex initialization lives here, as viewClasses is the default view of the app
// and this service is therefore initialized first

var knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: __dirname + "/bookManager.db"
    }
});


angular.module("mainApp")
    .service("viewClassStudentsService", function() {
        
        return {
            filterQuery: filterQuery
        }

        // functions for viewing class students

        function filterQuery(classFilter, nameFilter, gradeFilter) {
            
            let promise = knex('class_students')
                .innerJoin('classes', 'class_students.class_ID', 'classes.class_ID')
                .innerJoin('students', 'class_students.student_ID', 'students.student_ID')
                .select(
                    'class_students.class_student_ID',
                    'students.student_ID',
                    'classes.class_ID',
                    'classes.className',
                    'students.studentName',
                    'students.grade'
                    )
                .where('classes.className', 'like', classFilter + '%')
                .andWhere('students.studentName', 'like', '%' + nameFilter + '%')
                .andWhere('students.grade', 'like', gradeFilter + '%')

            return promise;
        }

        

        // functions for viewing class book issues

    });