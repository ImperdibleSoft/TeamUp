var teamUp = angular.module('teamUp', ['ngRoute']);
teamUp.config(function($routeProvider) {
	
    $routeProvider
        .when('/', {
            templateUrl : 'app/views/extension.html',
            controller  : 'extensionCtrl'
        })
        .otherwise({ 
 			redirectTo: '/' 
		}); 
});