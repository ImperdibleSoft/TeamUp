var teamUp = angular.module('teamUp', ['ngRoute']);
teamUp.config(function($routeProvider) {
	
    $routeProvider
        .when('/', {
            templateUrl : 'app/views/main.html',
            controller  : 'mainCtrl'
        })
        .otherwise({ 
 			redirectTo: '/' 
		}); 
});