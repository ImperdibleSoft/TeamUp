teamUp.controller("webCtrl", ['$scope', '$location', 'services', function($scope, $location, services){
 
	/*	Redirects to Extension view	*/
	var forceExtension = false;
	if(location.protocol == "chrome-extension:" || forceExtension){
		$location.url("/extension");
	}
	
	/*	Load the web controller	*/
	else{
		
		$("body").attr("mc-layout", "front");
		
		/*	Init variables	*/
		var locations;
		var debugging = false;
		
		$scope.appVersion = "";
		$scope.error = false;
		$scope.user = false;
		$scope.waiting = false;
		$scope.recruitingOnMyLocation = false;
		$scope.creatingRecruiting = false;
		$scope.recruitingsList = new Array();
		$scope.maxPlayers = 4;
		$scope.namePattern = /^[a-zA-Z0-9_]{4,}$/;
		$scope.officePattern = /^[a-zA-Z0-9]{3,}\ \-\ [a-zA-Z0-9\ ]{5,}$/;
		
		/*	Init function	*/
		/*	Get AppVersion	*/
		services.getAppVersion().success(function(response){
			$scope.appVersion = response.version;
			$("#appVersion").html($scope.appVersion);
		});
		
		/*	Get Locations	*/
		services.getLocations().success(function(response){
			locations = response.locations;
		});
		
		/*	Functions declaration	*/
		/*	Login the user	*/
		$scope.loginUser = function(){
			var form = $scope.loginForm;
			
			if(form.$valid){
				$scope.user = {
					"name": form.userName.$modelValue,
					"location": form.userLocation.$viewValue
				}
				
				form.userName.$setViewValue("");
				form.userName.$setPristine();
				form.userLocation.$setViewValue("");
				form.userLocation.$setPristine();
				form.$setPristine();
				
				$scope.userName = "";
				$scope.userLocation = "";
			}
		}
		
		/*	Logout the user	*/
		$scope.logoutUser = function(){
			$scope.user = false;
		}
		
		/*	Create Recruiting	*/
		$scope.createRecruiting = function(){
			$scope.creatingRecruiting = true;
		}
		$scope.decreaseMaxPlayers = function(){
			$scope.maxPlayers--;
		}
		$scope.increaseMaxPlayers = function(){
			$scope.maxPlayers++;
		}
		$scope.cancelRecruiting = function(){
			$scope.creatingRecruiting = false;
			$scope.recruitingForm.$submitted = false;
			$scope.recruitingForm.$dirty = false;
			$scope.recruitingForm.$pristine = true;
			
			$scope.description = "";
			$scope.maxPlayers = 4;
		}
		$scope.saveRecruiting = function(){
			var form = $scope.recruitingForm;
			if(form.$valid){
				var data = {
					"description": form.description.$modelValue,
					"maxPlayers": $scope.maxPlayers,
					"location": $scope.user.location
				}
				var temp = new Recruiting(data);
				temp.addPlayer();
				
				$scope.cancelRecruiting();
			}
		}
		
		/*	Parse a list of objects into a list of Recruitings	*/
		$scope.parseRecruitingsList = function(param){
			$scope.waiting = false;
			$scope.recruitingsList = new Array();
			for(var x in param){
				var temp = param[x];
				var data = {
					"id": temp.id ? temp.id : false,
					"description": temp.description,
					"location": temp.location,
					"maxPlayers": temp.maxPlayers,
					"players": temp.players,
					"date": temp.date ? temp.date : false,
					"completed": (temp.completed && temp.completed == "1") ? temp.completed: false
				};
				
				var recru = new Recruiting(data);
				for(var y in temp.players){
					recru.addPlayer(temp.players[y]);
					
					if(temp.players[y] == $scope.user.name && recru.completed == false){
						$scope.waiting = true;
						recru.myRecruiting = true;
					}
				}
				
				if(recru.location == $scope.user.location && recru.completed == false){
					$scope.recruitingOnMyLocation = true;
				}
				
				$scope.recruitingsList.push( recru );
			}
		}
		
		$scope.refreshPage = function(){
			var speed = 0;
			$("body > .mc-content").hide(speed, function(){
				$("body > .mc-content").show(speed);
			});
		}
		
		/*	Recruiting class	*/
		var Recruiting = function(data){
			var self = this
			this.id = data.id ? data.id : parseInt( Math.random() * 1000000 );
			this.description = data.description;
			this.location = data.location;
			this.maxPlayers = data.maxPlayers;
			this.players = new Array();
			this.date = data.date ? formatDate(data.date) : "0000-00-00 00:00:00";
			this.completed = data.completed ? data.completed : false;
			this.myRecruiting = data.myRecruiting ? data.myRecruiting : false;
			
			this.addPlayer = function(param){
				if(self.players.length < 4){
					if(param){
						self.players.push( param );
					}
					else{
						self.players.push( $scope.user.name );
						
						if(chrome && chrome.runtime && chrome.runtime.connect){
							
							/* Update a recruiting	*/
							var updateRecruiting = chrome.runtime.connect({name: "updateRecruiting"});
						
							debug("Sending updated recruiting to BackgroundJS");
							debug(self);
							
							/*	Send the current recruiting	*/
							updateRecruiting.postMessage({
								'recruiting': self
							});
							
							updateRecruiting.onMessage.addListener(function(response){
								if(response.recruitingsList){
									debug("Getting the recruitingsList from BackgroundJS");
									debug(response.recruitingsList);
									
									$scope.parseRecruitingsList(response.recruitingsList);
									
									debug("recruitingsList parsed");
									debug($scope.recruitingsList);
								}
								
								$("#refresh").click();
							});
						}
					}
				}
			}
			
			this.removePlayer = function(){
				if(self.players.indexOf( $scope.user.name ) >= 0){
					self.players.splice( self.players.indexOf( $scope.user.name ), 1 );
					
					if(chrome && chrome.runtime && chrome.runtime.connect){
						/* Update a recruiting	*/
						var updateRecruiting = chrome.runtime.connect({name: "updateRecruiting"});
						
						debug("Sending updated recruiting to BackgroundJS");
						debug(self);
							
						/*	Send the current recruiting	*/
						updateRecruiting.postMessage({
							'recruiting': self
						});
						
						updateRecruiting.onMessage.addListener(function(response){
							if(response.recruitingsList){
								debug("Getting the recruitingsList from BackgroundJS");
								debug(response.recruitingsList);
								
								$scope.parseRecruitingsList(response.recruitingsList);
								
								debug("recruitingsList parsed");
								debug($scope.recruitingsList);
							}
							
							$("#refresh").click();
						});
					}
				}
				
				if(self.players.length <= 0){
					
					if(chrome && chrome.runtime && chrome.runtime.connect){
						
						/* Create status connection	*/
						var removeRecruiting = chrome.runtime.connect({name: "removeRecruiting"});
						
						/*	Ask for conected user	*/
						removeRecruiting.postMessage({
							'id': self.id
						});
						
						removeRecruiting.onMessage.addListener(function(response){
							if(response.recruitingsList){
								debug("Getting the recruitingsList from BackgroundJS");
								debug(response.recruitingsList);
								
								$scope.parseRecruitingsList(response.recruitingsList);
								
								debug("recruitingsList parsed");
								debug($scope.recruitingsList);
							}
							
							$("#refresh").click();
						});
					}
				}
			}
		};
		
		var formatDate = function(param){
			var newDate = param.substring(11, 16);
			
			return newDate;
		}

		function debug(param){
			if(debugging === true){
				console.log(param);
			}
		}
		
	}
}]);
