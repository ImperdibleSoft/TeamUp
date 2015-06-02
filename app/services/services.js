teamUp.factory('services', function($http) {
   var service = {};
   
    service.getLocations = function(){
   		return $http({
   			method: 'GET',
   			url: 'api/data.json'
   		});
   };
   
   return service;
});