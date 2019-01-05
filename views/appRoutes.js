
angular.module("mainApp", ['ngRoute'])
    .config(['$routeProvider', function($routeProvider){

        // using the routeProvider module, map out files and controllers with respective routes
        $routeProvider

        .when('/', {
            templateUrl: __dirname + '/views/viewClassIssues/viewClassIssues.html',
            controller: 'viewClassIssuesController',
            controllerAs: 'ctrl'
        })

        .when('/viewClasses', {
            templateUrl: __dirname + '/views/viewClasses/viewClasses.html',
            controller: 'viewClassesController',
            controllerAs: 'ctrl'
        })

        .when('/viewClassStudents', {
            templateUrl: __dirname + '/views/viewClassStudents/viewClassStudents.html',
            controller: 'viewClassStudentsController',
            controllerAs: 'ctrl'
        })

        .when('/viewClassIssues', {
            templateUrl: __dirname + '/views/viewClassIssues/viewClassIssues.html',
            controller: 'viewClassIssuesController',
            controllerAs: 'ctrl'
        })

        .when('/addClasses', {
            templateUrl: __dirname + '/views/addClasses/addClasses.html',
            controller: 'addClassesController',
            controllerAs: 'ctrl'
        })

        .when('/addBooks', {
            templateUrl: __dirname + '/views/addBooks/addBooks.html',
            controller: 'addBooksController',
            controllerAs: 'ctrl'
        })

        .when('/viewBooks', {
            templateUrl: __dirname + '/views/viewBooks/viewBooks.html',
            controller: 'viewBooksController',
            controllerAs: 'ctrl'
        })

        .when('/addStudents', {
            templateUrl: __dirname + '/views/addStudents/addStudents.html',
            controller: 'addStudentsController',
            controllerAs: 'ctrl'
        })

        .when('/viewStudents', {
            templateUrl: __dirname + '/views/viewStudents/viewStudents.html',
            controller: 'viewStudentsController',
            controllerAs: 'ctrl'
        })

        .when('/viewRedemptions', {
            templateUrl: __dirname + '/views/viewRedemptions/viewRedemptions.html',
            controller: 'viewRedemptionsController',
            controllerAs: 'ctrl'
        })

        .when('/summary', {
            templateUrl: __dirname + '/views/summary/summary.html',
            controller: 'summaryController',
            controllerAs: 'ctrl'
        })


    }]);