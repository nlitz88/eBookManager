// knex initialization lives here, as viewClasses is the default view of the app
// and this service is therefore initialized first

var knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: __dirname + "/bookManager.db"
    }
});


angular.module("mainApp")
    .service("viewClassIssuesService", function() {
        
        return {
            filterQuery: filterQuery
        }

        // functions for viewing class students

        function filterQuery(issueFilter, redemptionCodeFilter, bookFilter, classFilter) {
            
            let promise = knex('class_book_issues')

                .innerJoin('classes', 'class_book_issues.class_ID', 'classes.class_ID')
                .innerJoin('books', 'class_book_issues.book_ID', 'books.book_ID')
                .select(
                    'class_book_issues.issue_ID',
                    'class_book_issues.redemptionCode',
                    'books.book_ID',
                    'books.bookName',
                    'classes.class_ID',
                    'classes.className'
                    )
                .where('class_book_issues.issue_ID', 'like', issueFilter + '%')
                .andWhere('class_book_issues.redemptionCode', 'like', redemptionCodeFilter + '%')
                .andWhere('books.bookName', 'like', bookFilter + '%')
                .andWhere('classes.className', 'like', classFilter + '%')
                
            return promise;
        }

        

        // functions for viewing class book issues

    });