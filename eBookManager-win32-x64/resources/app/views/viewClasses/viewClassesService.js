// knex initialization lives here, as viewClasses is the default view of the app
// and this service is therefore initialized first

var knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: __dirname + "/bookManager.db"
    }
});


angular.module("mainApp")
    .service("viewClassesService", function() {
        
        return {
            filterQuery: filterQuery
        }


        function filterQuery(class_IDFilter, classFilter) {

            let promise = knex('classes')

                .select(
                    'classes.class_ID',
                    'classes.className'
                    )
                .where('classes.className', 'like', '%' + classFilter + '%')
                .andWhere('classes.class_ID', 'like', class_IDFilter + '%')
                
            return promise;
        }

        

        // functions for viewing class class issues

    });