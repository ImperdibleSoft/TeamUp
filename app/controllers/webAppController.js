teamUp.controller("webAppCtrl", ['$scope', 'services', '$cookies', function($scope, services, $cookies){
 
	/*	Init variables	*/
	$scope.appVersion = "";
	$scope.viewAllRecruitings = false;
	$scope.vibrateOnNotifications = (mc.isMobile() || mc.isTablet()) ? true : false;;
	
	$scope.user = false;
	$scope.location = "";
	
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
		$("#backBtn").show();
		
		/*	Shows permanent notification	*/
		showInstallNotification();
		
		/*	Get AppVersion	*/
		services.getAppVersion().success(function(response){
			$scope.appVersion = response.version;
			$("#appVersion").html($scope.appVersion);
		});
		
		/*	Get Locations	*/
		services.getLocations().success(function(response){
			$scope.locations = response.locations;
		});
		
		/*	If there are cookies stored	*/
		if($cookies.userName && $cookies.userName.length > 0 && $cookies.userLocation && $cookies.userLocation.length > 0){
			$scope.user = {
				"name": $cookies.userName,
				"location": $cookies.userLocation
			};
			
			$scope.getNews();
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
			
			$cookies.userName = $scope.user.name;
			$cookies.userLocation = $scope.user.location;
			
			var existingLocation = false;
			for(var x in $scope.locations){
				if($scope.user.location == $scope.locations[x]){
					existingLocation = true;
				}
			}
			
			if(!existingLocation){
				var data = {
					'name': $scope.user.location
				};
				services.createLocation(data);
			}
		}
	
		$scope.getNews();
	}
	
	/* Get recruiting list */
	$scope.getNews = function(){
		
		if($scope.user){
			var data = {
				"location": $scope.user.location
			}
			
			services.getNews(data).success(function(response){
				
				$scope.parseRecruitingsList( response.recruitings );
				
				setTimeout(function(){ $scope.getNews(); }, conf.minutesToWaitBetweenChecks * 1000 * 60);
			});
		}
	}

	/*	Logout the user	*/
	$scope.logoutUser = function(){
		$scope.user = false;
		
		$cookies.userName = "";
		$cookies.userLocation = "";
		
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
			temp.addPlayer();
			
			services.createRecruiting(temp).success(function(response){
				if(response.recruitings){
					conf.debug("Getting the recruitingsList from BackgroundJS");
					conf.debug($scope.recruitingsList);
					
					$scope.parseRecruitingsList(response.recruitings);
					
					conf.debug("recruitingsList parsed");
					conf.debug($scope.recruitingsList);
				}
			});
			
			$scope.cancelRecruiting();
		}
	}
	
	/*	Parse a list of objects into a list of Recruitings	*/
	$scope.parseRecruitingsList = function(param){
		$scope.waiting = false;
		$scope.recruitingOnMyLocation = false;
		$scope.tempRecruitingsList = new Array();
		
		for(var x in param){
		
			/*	Parse data	*/
			/*	Fix the ID key	*/
			if(param[x].id_recruiting){
				param[x].id = param[x].id_recruiting;
			}
			
			/*	Converts players into an Array	*/
			if( typeof(param[x].players) !== "object" ){
				if( param[x].players.indexOf(",") >= 0 ){
					param[x].players = param[x].players.split(",");
				}
				else{
					temp = new Array();
					temp.push( param[x].players );
					param[x].players = temp;
				}
				
			}
			
			/*	If the recruiting has too much time or has no players	*/
			if(param[x].difference >= 2100 || param[x].players.length <= 0){
				var data = {
					'id': param[x].id,
					'location': $scope.user.location
				}
				services.removeRecruiting(data).success(function(response){
					if(response.recruitings){
						conf.debug("Getting the recruitingsList from BackgroundJS");
						conf.debug(response.recruitings);
						
						$scope.parseRecruitingsList(response.recruitings);
						
						conf.debug("recruitingsList parsed");
						conf.debug($scope.recruitingsList);
					}
				});
			}
			
			/*	If has the correct time and has players	*/
			else{
				
				var temp1 = param[x];
				var alreadyNotified = false;
				var remainingPlayers = false;
				
				/*	Verify already checked elements	*/
				for(var y in $scope.recruitingsList){
					var temp2 = $scope.recruitingsList[y];
					
					/*	Already checked recruiting	*/
					if(temp1.id == temp2.id){
						alreadyNotified = true;
						
						if(temp1.players.length != temp2.players.length){
							remainingPlayers = temp1.maxPlayers - temp1.players.length;
						}
						break;
					}
				}
				
				/*	Show notification	*/
				if(shouldShowThisNotification(temp1)){
					
					if(!alreadyNotified){
						remainingPlayers = temp1.maxPlayers - temp1.players.length;
						
						if(remainingPlayers > 0){
							showNotification("New recruiting", "There is a new recruiting for \""+ temp1.description +"\",  "+ remainingPlayers +" players remaining", temp1.id, $scope.vibrateOnNotifications);
						}
					}
					else if(remainingPlayers !== false){
						if(remainingPlayers > 0){
							showNotification("Recruiting update", "There are only "+ remainingPlayers +" players remaining for \""+ temp1.description +"\"", temp1.id, $scope.vibrateOnNotifications);
						}
						else{
							showNotification("Recruiting update", "All players for \""+ temp1.description +"\" are ready. Let's go!'", temp1.id, $scope.vibrateOnNotifications);
						}
					}
				}
			
				/*	Set the match as completed	*/
				if(temp1.players.length >= temp1.maxPlayers && temp1.completed != "1"){
					conf.debug("Completing recruiting with ID "+ temp1.id);
					
					var data = {
						"id": temp1.id,
						"location": $scope.user.location
					};
					
					services.completeRecruiting(data);
				}
				
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
		}
		
		$scope.recruitingsList = $scope.tempRecruitingsList;
	}
	
	$scope.refreshPage = function(){
		var speed = 0;
		$("body > .mc-content").hide(speed, function(){
			$("body > .mc-content").show(speed);
		});
	}
	
	/*	Verify if this recruiting notification should be shown	*/
	function shouldShowThisNotification(recruiting){
		
		if((!$scope.waiting || recruiting.players.indexOf($scope.user.name) >= 0 || $scope.viewAllRecruitings) && (!recruiting.completed || recruiting.completed == '0') && ( !recruiting.cancelled || recruiting.cancelled == '0')){
			var value = true;
		}
		else{
			var value = false;
		}
		
		conf.debug("Should show '"+ recruiting.description +"' notification: "+ value);
		return value;
	}

	/*	Creates a new Notification	*/
	showNotification = conf.showNotification;

	/*	Format date	*/
	var formatDate = function(param){
		var newDate = param.substring(11, 16);
		
		return newDate;
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
					var temp = new Array();
					for(var x in self.players){
						temp.push( self.players[x] );
					}
					temp.push( $scope.user.name );
					
					var data = {
						'id': self.id,
						'description': self.description,
						'maxPlayers': self.maxPlayers,
						'players': temp.toString(),
						'location': self.location
					};
					services.updateRecruiting(data).success(function(response){
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
		
		this.removePlayer = function(){
			if(self.players.indexOf( $scope.user.name ) >= 0){
				var temp = new Array();
				for(var x in self.players){
					temp.push( self.players[x] );
				}
				temp.splice( self.players.indexOf( $scope.user.name ), 1 );
				
				if(temp.length <= 0){
					self.cancelled = "1";
				}
				
				var data = {
					'id': self.id,
					'description': self.description,
					'maxPlayers': self.maxPlayers,
					'players': temp.toString(),
					'location': self.location
				};
				services.updateRecruiting(data).success(function(response){
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
	};
	
	function showInstallNotification(){
		var notif = "<div id='installnow' class='mc-notification mc-bg-darkblue'>";
			notif += "<button id='installExtension' class='mc-button mc-button-comb mc-clickable' mc-action='download' >Install</button>"
			notif += "<p class='mc-text'>Install chrome extension to still updated</p>";
		notif += "</div>";
		$(".mc-notification-container").append( notif );
		
		
		$("#installExtension").on("click", function(){
			var url = $("link[rel='chrome-webstore-item']").attr("href");
			chrome.webstore.install(url, 
			
			function(response){
				$("#installExtension").parent(".mc-notification").remove();
				
			}, function(error){
				
				$("#installExtension").html("Retry");
				$("#installExtension").attr("mc-action", "refresh");
			});
		});
	}
	
	$scope.init();

}]);
