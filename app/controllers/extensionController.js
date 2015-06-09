teamUp.controller("extensionCtrl", ['$scope', 'services', function($scope, services){
 
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
	
	/*	Functions declaration	*/
	/*	Init function	*/
	$scope.init = function(){
		
		/*	Change the layout	*/
		$("body").attr("mc-layout", "no-nav");
		
		/*	Show the "Back" button	*/
		$("#backBtn").hide();
		
		/*	Shows permanent notification	*/
		$(".mc-notification-container").html("");
		
		/*	Get AppVersion	*/
		services.getAppVersion().success(function(response){
			$scope.appVersion = response.version;
			$("#appVersion").html($scope.appVersion);
		});
		
		/*	Get Locations	*/
		services.getLocations().success(function(response){
			locations = response.locations;
		});
			
		/*	Connection with BackgroundJS	*/
		if(chrome && chrome.runtime && chrome.runtime.connect){
			
			/* Create status connection	*/
			var status = chrome.runtime.connect({name: "status"});
			
			/*	Ask for conected user	*/
			status.postMessage({
				'status': null
			});
			
			status.onMessage.addListener(function(response){
				if(response.user){
					$scope.user = response.user;
				}
				
				if(response.recruitingsList){
					conf.debug("Getting the recruitingsList from BackgroundJS");
					conf.debug(response.recruitingsList);
					
					$scope.parseRecruitingsList(response.recruitingsList);
					
					conf.debug("recruitingsList parsed");
					conf.debug($scope.recruitingsList);
				}
				
				if(response.viewAllRecruitings){
					$scope.viewAllRecruitings = response.viewAllRecruitings;
				}
				
				if(response.error){
					$scope.error = response.error;
				}
			});
			
			/* Create recruitings connection	*/
			chrome.runtime.onConnect.addListener(function(recruitings){
				if(recruitings.name == "recruitings"){
					recruitings.onMessage.addListener(function(response){
						conf.debug("Getting the recruitingsList from BackgroundJS");
						conf.debug(response.recruitings);
						
						$scope.parseRecruitingsList(response.recruitings);
						
						conf.debug("recruitingsList parsed");
						conf.debug($scope.recruitingsList);
					});
				}
			});
			
			/* Create connError connection	*/
			chrome.runtime.onConnect.addListener(function(connError){
				if(connError.name == "connError"){
					connError.onMessage.addListener(function(response){
						
						$scope.error = response.error;
						
					});
				}
			});
		}
	}
	
	/*	Login the user	*/
	$scope.loginUser = function(){
		var form = $scope.loginForm;
		
		if(form.$valid){
			$scope.user = {
				"name": form.userName.$modelValue,
				"location": form.userLocation.$viewValue
			}
			
			/*	Call the createLocation service	*/
			if(chrome && chrome.runtime && chrome.runtime.connect){
				
				var existingLocation = false;
				for(var x in locations){
					if( locations[x].name ==  $scope.user.location ){
						existingLocation = true;
					}
				}
				
				/* Connect width background.js	*/
				var login = chrome.runtime.connect({name: "login"});
				
				/*	Send login data	*/
				login.postMessage({
					'user': $scope.user,
					'createLocation': !existingLocation
				});
				
				login.onMessage.addListener(function(response){
					
				});
				
				/*	Disconnection	*/
				login.onDisconnect.addListener(function(event){
					
				});
				
			}
			
		}
	}
	
	/*	Logout the user	*/
	$scope.logoutUser = function(){
		$scope.user = false;
		
		/*	Call the createLocation service	*/
		if(chrome && chrome.runtime && chrome.runtime.connect){
			
			var existingLocation = false;
			for(var x in locations){
				if( locations[x].name ==  $scope.user.location ){
					existingLocation = true;
				}
			}
			
			/* Connect width background.js	*/
			var logout = chrome.runtime.connect({name: "logout"});
			
			/*	Send logout data	*/
			logout.postMessage({
				'user': false
			});
		}
		
		location.reload();
	}
	
	/*	Updates the list view	*/
	$scope.updateView = function(e){
		if(chrome && chrome.runtime && chrome.runtime.connect){
			
			/* Create status connection	*/
			var viewAllRecruitings = chrome.runtime.connect({name: "viewAllRecruitings"});
			
			/*	Ask for conected user	*/
			viewAllRecruitings.postMessage({
				'viewAllRecruitings': e.viewAllRecruitings
			});
			
			viewAllRecruitings.onMessage.addListener(function(response){
				
			});
		}
		
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
			
			if(chrome && chrome.runtime && chrome.runtime.connect){
				
				/* Connect width background.js	*/
				var create = chrome.runtime.connect({name: "create"});
				
				/*	Ask for conected user	*/
				create.postMessage({
					'create': temp
				});
				
				conf.debug("Sending new recruiting");
				conf.debug(temp);
				
				create.onMessage.addListener(function(response){
					
					if(response.recruitingsList){
						conf.debug("Getting the recruitingsList from BackgroundJS");
						conf.debug(response.recruitings);
						
						$scope.parseRecruitingsList(response.recruitings);
						
						conf.debug("recruitingsList parsed");
						conf.debug($scope.recruitingsList);
					}
				});
			}
			
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
		
		$("#refresh").click();
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
					
						conf.debug("Sending updated recruiting to BackgroundJS");
						conf.debug(self);
						
						/*	Send the current recruiting	*/
						updateRecruiting.postMessage({
							'recruiting': self
						});
						
						updateRecruiting.onMessage.addListener(function(response){
							if(response.recruitingsList){
								conf.debug("Getting the recruitingsList from BackgroundJS");
								conf.debug(response.recruitingsList);
								
								$scope.parseRecruitingsList(response.recruitingsList);
								
								conf.debug("recruitingsList parsed");
								conf.debug($scope.recruitingsList);
							}
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
					
					conf.debug("Sending updated recruiting to BackgroundJS");
					conf.debug(self);
						
					/*	Send the current recruiting	*/
					updateRecruiting.postMessage({
						'recruiting': self
					});
					
					updateRecruiting.onMessage.addListener(function(response){
						if(response.recruitingsList){
							conf.debug("Getting the recruitingsList from BackgroundJS");
							conf.debug(response.recruitingsList);
							
							$scope.parseRecruitingsList(response.recruitingsList);
							
							conf.debug("recruitingsList parsed");
							conf.debug($scope.recruitingsList);
						}
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
							conf.debug("Getting the recruitingsList from BackgroundJS");
							conf.debug(response.recruitingsList);
							
							$scope.parseRecruitingsList(response.recruitingsList);
							
							conf.debug("recruitingsList parsed");
							conf.debug($scope.recruitingsList);
						}
					});
				}
			}
		}
	};
	
	var formatDate = function(param){
		var newDate = param.substring(11, 16);
		
		return newDate;
	}

	$scope.init();
	
}]);