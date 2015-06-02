teamUp.factory('services', function($http) {
	
	//var apiURL = "http://teamup.imperdiblesoft.com/APIs/public.php?action="
	var apiURL = "http://dev.teamup.imperdiblesoft.com/APIs/public.php?action="

   var service = {};
   
    service.getLocations = function(){
   		return $http({
   			method: 'GET',
   			url: apiURL +'getLocations'
   		});
   };
   
   return service;
});