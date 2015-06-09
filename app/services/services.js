teamUp.factory('services', function($http) {

   var service = {};
   
	service.getAppVersion = function(param){
		return $http({
			method: 'GET',
			url: param ? '../manifest.json' : 'manifest.json'
		});
	};

	service.getLocations = function(){
		return $http({
			method: 'GET',
			url: conf.apiURL() +'getLocations'
		});
	};

	service.createLocation = function(location){
		return $http({
			method: 'POST',
			url: conf.apiURL() +'createLocation',
			data: {
				'name': location
			}
		});
	};

	service.getNews = function(location){
		return $http({
			method: 'POST',
			url: conf.apiURL() +'getRecruitings',
			data: location
		});
	};

	service.createRecruiting = function(recruiting){
		return $http({
			method: 'POST',
			url: conf.apiURL() +'createRecruiting',
			data: recruiting
		});
	};

	service.updateRecruiting = function(recruiting){
		return $http({
			method: 'POST',
			url: conf.apiURL() +'updateRecruiting',
			data: recruiting
		});
	};

	service.completeRecruiting = function(recruiting){
		return $http({
   			method: 'POST',
   			url: conf.apiURL() +'completeRecruiting',
			data: recruiting
   		});
	};

	service.removeRecruiting = function(recruiting){
		return $http({
   			method: 'POST',
   			url: conf.apiURL() +'removeRecruiting',
			data: recruiting
   		});
	};
   
   return service;
});