teamUp.controller("mainCtrl", ['$scope', 'services', function($scope, services){
 
	/*	Init variables	*/
	$scope.user = false;
	$scope.recruitingOnMyLocation = false;
	$scope.creatingRecruiting = false;
	$scope.recruitingsList = new Array();
	$scope.maxPlayers = 4;
	$scope.namePattern = /^[a-zA-Z0-9_]{4,}$/;
	$scope.officePattern = /^[a-zA-Z0-9]{3,}\ \-\ [a-zA-Z0-9\ ]{5,}$/;
	
	/*	Init function	*/
	/*	Connection with BackgroundJS	*/
	if(chrome.runtime.connect){
		
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
				console.log("Getting the recruitingsList from BackgroundJS");
				console.log(response.recruitingsList);
				
				$scope.parseRecruitingsList(response.recruitingsList);
				
				console.log("recruitingsList parsed");
				console.log($scope.recruitingsList);
			}
			
			$("#refresh").click();
		});
		
		/* Create recruitings connection	*/
		chrome.runtime.onConnect.addListener(function(recruitings){
			if(recruitings.name == "recruitings"){
				recruitings.onMessage.addListener(function(response){
					console.log("Getting the recruitingsList from BackgroundJS");
					console.log(response.recruitings);
					
					$scope.parseRecruitingsList(response.recruitings);
					
					console.log("recruitingsList parsed");
					console.log($scope.recruitingsList);
				});
			}
		});
		
	}
	
	/*	Functions declaration	*/
	/*	Login the user	*/
	$scope.loginUser = function(){
		var form = $scope.loginForm;
		
		if(form.$valid){
			$scope.user = {
				"name": form.userName.$modelValue,
				"location": form.userLocation.$modelValue
			}
			
			/*	Call the createLocation service	*/
			if(chrome.runtime.connect){
				
				/* Connect width background.js	*/
				var login = chrome.runtime.connect({name: "login"});
				
				/*	Send login data	*/
				login.postMessage({
					'user': $scope.user
				});
				
				login.onMessage.addListener(function(response){
					
				});
				
				/*	Disconnection	*/
				login.onDisconnect.addListener(function(event){
					
				});
				
			}
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
			
			if(chrome.runtime.connect){
				
				/* Connect width background.js	*/
				var create = chrome.runtime.connect({name: "create"});
				
				/*	Ask for conected user	*/
				create.postMessage({
					'create': temp
				});
				
				console.log("Sending new recruiting");
				console.log(temp);
				
				create.onMessage.addListener(function(response){
					
					if(response.recruitingsList){
						console.log("Getting the recruitingsList from BackgroundJS");
						console.log(response.recruitings);
						
						$scope.parseRecruitingsList(response.recruitings);
						
						console.log("recruitingsList parsed");
						console.log($scope.recruitingsList);
					}
					
					$("#refresh").click();
				});
			}
			
			$scope.cancelRecruiting();
		}
	}
	
	/*	Parse a list of objects into a list of Recruitings	*/
	$scope.parseRecruitingsList = function(param){
		$scope.recruitingsList = new Array();
		for(var x in param){
			var temp = param[x];
			var data = {
				"id": temp.id ? temp.id : false,
				"description": temp.description,
				"location": temp.location,
				"maxPlayers": temp.maxPlayers,
				"players": temp.players
			};
			
			var recru = new Recruiting(data);
			$scope.user.waiting = false;
			for(var y in temp.players){
				recru.addPlayer(temp.players[y]);
				
				if(temp.players[y] == $scope.user.name){
					$scope.user.waiting = true;
				}
			}
			
			if(recru.location == $scope.user.location){
				$scope.recruitingOnMyLocation = true;
			}
			
			
			$scope.recruitingsList.push( recru );
		}
	}
	
	/*	Recruiting class	*/
	var Recruiting = function(data){
		var self = this
		this.id = data.id ? data.id : parseInt( Math.random() * 1000000 );
		this.description = data.description;
		this.location = data.location;
		this.maxPlayers = data.maxPlayers;
		this.players = new Array();
		
		this.addPlayer = function(param){
			if(self.players.length < 4){
				if(param){
					self.players.push( param );
				}
				else{
					self.players.push( $scope.user.name );
					
					/* Update a recruiting	*/
					var updateRecruiting = chrome.runtime.connect({name: "updateRecruiting"});
				
					console.log("Sending updated recruiting to BackgroundJS");
					console.log(self);
					
					/*	Send the current recruiting	*/
					updateRecruiting.postMessage({
						'recruiting': self
					});
					
					updateRecruiting.onMessage.addListener(function(response){
						if(response.recruitingsList){
							console.log("Getting the recruitingsList from BackgroundJS");
							console.log(response.recruitingsList);
							
							$scope.parseRecruitingsList(response.recruitingsList);
							
							console.log("recruitingsList parsed");
							console.log($scope.recruitingsList);
						}
						
						$("#refresh").click();
					});
				
				}
				
				
			}
		}
		
		this.removePlayer = function(){
			if(self.players.indexOf( $scope.user.name ) >= 0){
				self.players.splice( self.players.indexOf( $scope.user.name ), 1 );
				
				/* Update a recruiting	*/
				var updateRecruiting = chrome.runtime.connect({name: "updateRecruiting"});
				
				console.log("Sending updated recruiting to BackgroundJS");
				console.log(self);
				
				/*	Send the current recruiting	*/
				updateRecruiting.postMessage({
					'recruiting': self
				});
				
				updateRecruiting.onMessage.addListener(function(response){
					if(response.recruitingsList){
						console.log("Getting the recruitingsList from BackgroundJS");
						console.log(response.recruitingsList);
						
						$scope.parseRecruitingsList(response.recruitingsList);
						
						console.log("recruitingsList parsed");
						console.log($scope.recruitingsList);
					}
					
					$("#refresh").click();
				});
			}
			
			if(self.players.length <= 0){
				
				/* Create status connection	*/
				var removeRecruiting = chrome.runtime.connect({name: "removeRecruiting"});
				
				/*	Ask for conected user	*/
				removeRecruiting.postMessage({
					'id': self.id
				});
				
				removeRecruiting.onMessage.addListener(function(response){
					if(response.recruitingsList){
						console.log("Getting the recruitingsList from BackgroundJS");
						console.log(response.recruitingsList);
						
						$scope.parseRecruitingsList(response.recruitingsList);
						
						console.log("recruitingsList parsed");
						console.log($scope.recruitingsList);
					}
					
					$("#refresh").click();
				});
			}
		}
	};
}]);
