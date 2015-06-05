var teamUp = angular.module('teamUp', ['ngRoute']);
teamUp.config(function($routeProvider) {
	
    $routeProvider
        .when('/', {
            templateUrl : 'app/views/web.html',
            controller  : 'webCtrl'
        })
        .when('/extension', {
            templateUrl : 'app/views/extension.html',
            controller  : 'extensionCtrl'
        })
        .otherwise({ 
 			redirectTo: '/' 
		}); 
});