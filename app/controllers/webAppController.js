teamUp.controller("webAppCtrl", ['$scope', 'services', '$cookies', '$q', function($scope, services, $cookies, $q){
 
	/*	Init variables	*/
	$scope.appVersion = "";
	$scope.viewAllRecruitingsOption = false;
	$scope.vibrateOnNotifications = (mc.isMobile() || mc.isTablet()) ? true : false;
	
	$scope.user = false;
	$scope.location = "";
	$scope.locations = false;
	
	$scope.waiting = false;
	$scope.recruitingOnMyLocation = false;
	$scope.creatingRecruiting = false;
	$scope.creatingRecruitingPromise = false;
	
	$scope.recruitingsList = new Array();
	$scope.maxPlayers = 4;
	
	$scope.namePattern = /^[a-zA-Z0-9_\-\ \.]{3,}$/;
	$scope.officePattern = /^[a-zA-Z0-9]{3,}\ \-\ [a-zA-Z0-9\ ]{5,}$/;
		
	$scope.isChromeBrowser = conf.isChromeBrowser();
	
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
	
		/*	Get notification permissions	*/
		if(Notification && Notification.permission == "granted"){
			$scope.notificationsAllowed = true;
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
			$scope.creatingRecruitingPromise = true;
			
			services.createRecruiting(temp).success(function(response){
				if(response.recruitings){
					
					$scope.createRecruitingPromise = $q(function(resolve, reject) {
						conf.debug("Getting the recruitingsList from BackgroundJS");
						conf.debug(response.recruitings);
						
						$scope.parseRecruitingsList(response.recruitings, resolve);
						
						conf.debug("recruitingsList parsed");
						conf.debug($scope.recruitingsList);
					});
					
					/*	ParseRecruitingsList finished	*/
					$scope.createRecruitingPromise.then(function(response){
						
						conf.debug("Adding to the Recruiting");
						temp.addPlayer();
						$scope.creatingRecruitingPromise = false;
					});
				}
			});
			
			$scope.cancelRecruiting();
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
	
	/*	Custom format date	*/
	var formatDate = function(param){
		var newDate = param.substring(11, 16);
		
		return newDate;
	}
	
	/*	Parse a list of objects into a list of Recruitings	*/
	$scope.parseRecruitingsList = function(param, resolve){
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
				else if(param[x].players != ""){
					temp = new Array();
					temp.push( param[x].players );
					param[x].players = temp;
				}
			}
			
			/*	If the recruiting has too much time or has no players	*/
			if(param[x].players.length <= 0){
				var data = {
					'id': param[x].id,
					'location': $scope.user.location
				}
				services.removeRecruiting(data).success(function(response){
					if(resolve){
						resolve("Finished");						
					}
					
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
					temp1.completed = "1";
				}
				
				/*	Create the recruiting	*/
				var recru = new Recruiting(temp1);
				
				/*	Add players to the recruiting	*/
				for(var y in temp1.players){
					recru.addPlayer(temp1.players[y]);
					
					if(temp1.players[y] == $scope.user.name){
						$scope.waiting = true;
						recru.myRecruiting = true;
					}
				}
				
				/*	If it is my recruiting, or if it is not completed	*/
				if(recru.myRecruiting == true || recru.completed != '1'){
					
					/*	Verify if there are recruitings on my location	*/
					if(recru.location == $scope.user.location){
						$scope.recruitingOnMyLocation = true;
					}
					
					/*	If the recruiting is completed	*/
					if(recru.completed == '1'){
						$scope.waiting = false;
					}
					
					/*	Add the recruiting to the list	*/
					$scope.tempRecruitingsList.push( recru );
					
				}
			}
		}
		
		$scope.recruitingsList = $scope.tempRecruitingsList;
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

	/*	BACKGROUND: Verify if this recruiting notification should be shown	*/
	function shouldShowThisNotification(recruiting){
		
		if((!$scope.waiting || recruiting.players.indexOf($scope.user.name) >= 0 || $scope.viewAllRecruitingsOption) && ( !recruiting.cancelled || recruiting.cancelled == '0')){
			var value = true;
		}
		else{
			var value = false;
		}
		
		conf.debug("Should show '"+ recruiting.description +"' notification: "+ value);
		return value;
	}

	/*	BACKGROUND: Creates a new Notification	*/
	showNotification = conf.showNotification;

	/*	WEBAPP: Create notification to install extension	*/
	function showInstallNotification(){
			
		/*	Create the notification	*/
		var notif = "<div id='installnow' class='mc-notification mc-bg-darkblue mc-pc mc-tv'>";
			notif += "<button id='installExtension' class='mc-button mc-button-comb mc-clickable' mc-action='download' >Install</button>"
			notif += "<p class='mc-text'>Install our browser extension to still up to date!</p>";
		notif += "</div>";
		$(".mc-notification-container").append( notif );
		
		$("#installExtension").on("click", function(){
			
			/*	If we are on Chrome, install the extension	*/
			if($scope.isChromeBrowser){
				var url = $("link[rel='chrome-webstore-item']").attr("href");
				chrome.webstore.install(url, 
				
				function(response){
					$("#installExtension").parent(".mc-notification").remove();
					
				}, function(error){
					
					$("#installExtension").html("Retry");
					$("#installExtension").attr("mc-action", "refresh");
				});
			}
			
			/*	If we are not in chrome, go to Chrome Web Store	*/
			else{
				window.open("https://chrome.google.com/webstore/detail/team-up/ggodlfmnafpmahoddgdlngfnhnkfnedj");
			}
		});
	}
	
	/*	WEBAPP: Ask the user to allow native notifications	*/
	$scope.allowNotifications = function(){
		if(Notification.requestPermission){
			Notification.requestPermission(function(){
				if(Notification.permission == "granted"){
					$scope.notificationsAllowed = true;
				}
			});
		}
	}
	
	$scope.init();

}]);
