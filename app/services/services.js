teamUp.factory('services', function($http) {
   var service = {};
   
    service.getLocations = function(){
   		return $http({
   			method: 'GET',
   			url: 'APIs/data.json'
   		});
   };
   
   return service;
});