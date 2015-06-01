var app = angular.module('Angular_Practice', ['ngRoute']);
app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl : 'app/views/view1.html',
            controller  : 'view1Controller'
        })
        .when('/view2', {
            templateUrl : 'app/views/view2.html',
            controller  : 'view2Controller'
        })
        .otherwise({ 
 			redirectTo: '/' 
			}); 
});