angular.module("mainApp")
    .service("crudService", function() {

        // THIS SERVICE INTENDED FOR BASIC CRUD APPLICATIONS
        // NOT DESIGNED TO HANDLE INNER JOINS, COMPLICATED QUERIES, ETC.
        
        return {
            dbDelete: dbDelete,
            dbUpdate: dbUpdate,
            dbLookup: dbLookup,
            dbInsert: dbInsert,
            dbSelectAll: dbSelectAll,
            dbInsertStudents: dbInsertStudents,
            dbInsertBooks: dbInsertBooks
        }

        // functions for basic Create, Read, Update, and Delete
        


        // delete rows provided table, column, and keys (keys as array)
        function dbDelete(table, column, key) {
            
            let promise = knex(table).where(column, key).del();
            return promise;
            
        }



        // updates object at given key. updatedObject does not have to contain all required columns
        // used for updating tables that you have the already have the ID'S for
        function dbUpdate(table, column, key, updatedObject) {

            var formattedObject = {};
            

            var tableAttributes = {
                students: ["student_ID", "studentName", "grade"],
                classes: ["class_ID", "className"],
                books: ["book_ID", "bookName"],
                class_students: ["class_student_ID", "class_ID", "student_ID"],
                class_book_issues: ["issue_ID", "book_ID", "redemptionCode", "class_ID"],
                redemptions: ["redemption_ID", "student_ID", "issue_ID", "class_ID", "date"]
            }


            // create formatted object dynamically to be passed to knex query
            for(var x=0; x<tableAttributes[table].length; x++) {
                attr = tableAttributes[table][x];
                if(updatedObject[attr] != undefined) formattedObject[attr] = updatedObject[attr];
            }


            let promise = knex(table).where(column, key).update(formattedObject);
            return promise;

        }



        function dbLookup(updatedObject, lookupTable) {

            // presets for different tables
            let lookupOptions = {}
            
            if(lookupTable == "classes") {
                lookupOptions = {
                    desired: "class_ID",
                    table: lookupTable,
                    lookupColumn: "className",
                    lookupKey: updatedObject.className,
                }
            }
            else if(lookupTable == "students") {
                lookupOptions = {
                    desired: "student_ID",
                    table: lookupTable,
                    lookupColumn: "studentName",
                    lookupKey: updatedObject.studentName
                }
            }
            else if(lookupTable == "books") {
                lookupOptions = {
                    desired: "book_ID",
                    table: lookupTable,
                    lookupColumn: "bookName",
                    lookupKey: updatedObject.bookName
                }
            }
            else if(lookupTable == 'class_book_issues') {
                lookupOptions = {
                    desired: 'issue_ID',
                    table:  lookupTable,
                    lookupColumn: 'redemptionCode',
                    lookupKey: updatedObject.redemptionCode
                }
            }

            // lookup data in database
            let promise = knex(lookupOptions.table).select(lookupOptions.desired).where(lookupOptions.lookupColumn, lookupOptions.lookupKey);
            return promise;       

        }
        
        

        // inserts data into provided table
        function dbInsert(table, newObject) {
            let promise = knex(table).insert(newObject);
            return promise;
        }



        // alternate Insert functions for less advanced queries
        function dbInsertStudents(newObject) {
            let promise = knex('students').insert({studentName: newObject.studentName, grade: newObject.grade});
            return promise;
        }

        function dbInsertBooks(newObject) {
            let promise = knex('books').insert({bookName: newObject.bookName});
            return promise;
        }



        
        function dbSelectAll(table, desired) {
            let promise = knex(table).select(desired);
            return promise;
        }



    });