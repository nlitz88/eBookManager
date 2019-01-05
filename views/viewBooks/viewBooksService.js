// knex initialization lives here, as viewClasses is the default view of the app
// and this service is therefore initialized first

var knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: __dirname + "/bookManager.db"
    }
});


angular.module("mainApp")
    .service("viewBooksService", function() {
        
        return {
            filterQuery: filterQuery
        }


        function filterQuery(book_IDFilter, bookFilter) {

            let promise = knex('books')

                .select(
                    'books.book_ID',
                    'books.bookName'
                    )
                .where('books.bookName', 'like', '%' + bookFilter + '%')
                .andWhere('books.book_ID', 'like', book_IDFilter + '%')
                
            return promise;
        }

        

        // functions for viewing class book issues

    });