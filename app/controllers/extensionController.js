teamUp.controller("extensionCtrl", ['$scope', 'services', function($scope, services){
 
	/*	Init variables	*/
	$scope.appVersion = "";
	$scope.error = false;
	$scope.viewAllRecruitings = false;
	$scope.vibrateOnNotifications = (mc.isMobile() || mc.isTablet()) ? true : false;;
	
	$scope.user = false;
	$scope.location = "";
	$scope.locations = false;
	
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
		
		/*	Get AppVersion	*/
		services.getAppVersion().success(function(response){
			$scope.appVersion = response.version;
			$("#appVersion").html($scope.appVersion);
		});
		
		/*	Get Locations	*/
		services.getLocations().success(function(response){
			$scope.locations = response.locations;
		});
		
		/*	If there is a user connected	*/
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
				
				if(response.recruitings){
					conf.debug("Getting the recruitingsList from BackgroundJS");
					conf.debug(response.recruitings);
					
					$scope.parseRecruitingsList(response.recruitings);
					
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
			
			/* Create recruitings connection listener	*/
			chrome.runtime.onConnect.addListener(function(updateRecruitings){
				if(updateRecruitings.name == "updateRecruitings"){
					updateRecruitings.onMessage.addListener(function(response){
					
						if(response.recruitings){
							conf.debug("Getting the recruitingsList from BackgroundJS");
							conf.debug(response.recruitings);
							
							$scope.parseRecruitingsList(response.recruitings);
							
							conf.debug("recruitingsList parsed");
							conf.debug($scope.recruitingsList);
						}
					});
				}
			});
			
			/* Create connError connection listener	*/
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
				for(var x in $scope.locations){
					if( $scope.locations[x].name ==  $scope.user.location ){
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
			}
		}
	}
	
	/*	Logout the user	*/
	$scope.logoutUser = function(){
		$scope.user = false;
		
		/*	Call the createLocation service	*/
		if(chrome && chrome.runtime && chrome.runtime.connect){
			
			/* Connect width background.js	*/
			var logout = chrome.runtime.connect({name: "logout"});
			
			/*	Send logout data	*/
			logout.postMessage({
				'user': false
			});
		}
		
		location.reload();
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
			
			if(chrome && chrome.runtime && chrome.runtime.connect){
				
				/* Connect width background.js	*/
				var create = chrome.runtime.connect({name: "create"});
				
				conf.debug("Sending new recruiting");
				conf.debug(temp);
				
				/*	Ask for conected user	*/
				create.postMessage({
					'create': temp
				});
				
				create.onMessage.addListener(function(response){
					
					if(response.recruitings){
						
						conf.debug("Getting the recruitingsList from BackgroundJS");
						conf.debug(response.recruitings);
						
						$scope.parseRecruitingsList(response.recruitings);
						
						conf.debug("recruitingsList parsed");
						conf.debug($scope.recruitingsList);
						
						for(var x in response.recruitings){
							if($scope.recruitingsList[x].description == temp.description && $scope.recruitingsList[x].maxPlayers == temp.maxPlayers && $scope.recruitingsList[x].location == temp.location){
								$scope.recruitingsList[x].addPlayer();
							}
						}
					}
				});
			}
			
			$scope.cancelRecruiting();
		}
	}
	
	/*	Hide and show the page	*/
	$scope.refreshPage = function(){
		var speed = 0;
		$("body > .mc-content").hide(speed, function(){
			$("body > .mc-content").show(speed);
		});
	}
	
	/*	Updates the list view	*/
	$scope.setViewAllRecruitings = function(e){
		if(chrome && chrome.runtime && chrome.runtime.connect){
			
			/* Create status connection	*/
			var setViewAllRecruitings = chrome.runtime.connect({name: "setViewAllRecruitings"});
			
			/*	Ask for conected user	*/
			setViewAllRecruitings.postMessage({
				'viewAllRecruitings': e.viewAllRecruitings
			});
		}
		
	}
	
	/*	Parse a list of objects into a list of Recruitings	*/
	$scope.parseRecruitingsList = function(param){
		$scope.waiting = false;
		$scope.recruitingOnMyLocation = false;
		$scope.tempRecruitingsList = new Array();
		
		for(var x in param){
		
			/*	Parse data	*/
			var temp1 = param[x];
			
			/*	Create the recruiting	*/
			var recru = new Recruiting(temp1);
			
			/*	Add players to the recruiting	*/
			for(var y in temp1.players){
				recru.addPlayer(temp1.players[y]);
				
				if(temp1.players[y] == $scope.user.name && recru.completed == false){
					$scope.waiting = true;
					recru.myRecruiting = true;
				}
			}
			
			/*	Verify if there are recruitings on my location	*/
			if(recru.location == $scope.user.location && recru.completed == false){
				$scope.recruitingOnMyLocation = true;
			}
			
			$scope.tempRecruitingsList.push( recru );
		}
		
		$scope.recruitingsList = $scope.tempRecruitingsList;
		$("#refresh").click();
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
							if(response.recruitings){
								conf.debug("Getting the recruitingsList from BackgroundJS");
								conf.debug(response.recruitings);
								
								$scope.parseRecruitingsList(response.recruitings);
								
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
				var temp = new Array();
				for(var x in self.players){
					temp.push( self.players[x] );
				}
				temp.splice( self.players.indexOf( $scope.user.name ), 1 );
				self.players = temp;
				
				if(self.players.length <= 0){
					self.cancelled = "1";
				}
		
				var data = {
					'id': self.id,
					'description': self.description,
					'maxPlayers': self.maxPlayers,
					'players': temp,
					'cancelled': self.cancelled ? self.cancelled : false,
					'location': self.location
				};
				if(chrome && chrome.runtime && chrome.runtime.connect){
				
					/* Update a recruiting	*/
					var updateRecruiting = chrome.runtime.connect({name: "updateRecruiting"});
				
					/* Update a recruiting	*/
					conf.debug("Sending updated recruiting to BackgroundJS");
					conf.debug(data);
						
					/*	Send the current recruiting	*/
					updateRecruiting.postMessage({
						'recruiting': data
					});
					
					updateRecruiting.onMessage.addListener(function(response){
						if(response.recruitings){
							conf.debug("Getting the recruitingsList from BackgroundJS");
							conf.debug(response.recruitings);
							
							$scope.parseRecruitingsList(response.recruitings);
							
							conf.debug("recruitingsList parsed");
							conf.debug($scope.recruitingsList);
						}
					});
				}
			}
		}
	};
	
	/*	Custom format date	*/
	var formatDate = function(param){
		var newDate = param.substring(11, 16);
		
		return newDate;
	}

	$scope.init();
	
}]);