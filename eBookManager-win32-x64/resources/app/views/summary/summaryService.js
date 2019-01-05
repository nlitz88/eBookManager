// knex initialization lives here, as viewClasses is the default view of the app
// and this service is therefore initialized first

var knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: __dirname + "/bookManager.db"
    }
});


angular.module("mainApp")
    .service("summaryService", function() {
        
        return {
            filterQuery: filterQuery
        }

        // functions for viewing class students

        function filterQuery(startDate, endDate) {

            let promise = knex('redemptions')
                // consider adding nested inner joins to reduce query redundancy
                .innerJoin('classes', 'redemptions.class_ID', 'classes.class_ID')
                .innerJoin('students', 'redemptions.student_ID', 'students.student_ID')
                .innerJoin('class_book_issues', 'redemptions.issue_ID', 'class_book_issues.issue_ID')
                .innerJoin('books', 'redemptionS.book_ID', 'books.book_ID')
                .select(
                    'students.student_ID',
                    'students.studentName',
                    'students.grade',
                    'class_book_issues.issue_ID',
                    'class_book_issues.redemptionCode',
                    'books.book_ID',
                    'books.bookName',
                    'classes.class_ID',
                    'classes.className',
                    'redemptions.date',
                    'redemptions.redemption_ID'
                    )
                .whereBetween('redemptions.date', [startDate, endDate])
                
            return promise;
        }

        

        // functions for viewing class book issues

    });