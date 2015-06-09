var teamUp = angular.module('teamUp', ['ngRoute', 'ngCookies']);
teamUp.config(function($routeProvider) {
	
    $routeProvider
        .when('/', {
            templateUrl : 'app/views/web.html',
            controller  : 'webCtrl'
        })
        .when('/webapp', {
            templateUrl : 'app/views/webapp.html',
            controller  : 'webAppCtrl'
        })
        .when('/extension', {
            templateUrl : 'app/views/extension.html',
            controller  : 'extensionCtrl'
        })
        .otherwise({ 
 			redirectTo: '/' 
		}); 
});