teamUp.controller("mainCtrl", ['$scope', 'services', function($scope, services){
 
	/*	Init variables	*/
	$scope.user = false;
	$scope.creatingReclutation = false;
	$scope.reclutations = new Array();
	$scope.maxPlayers = 4;
	$scope.namePattern = /^[a-zA-Z0-9_]{4,}$/;
	$scope.officePattern = /^[a-zA-Z0-9]{3,}\ \-\ [a-zA-Z0-9\ ]{5,}$/;
	
	/*	Init function	*/
	
	/*	Functions declaration	*/
	/*	Connection with BackgroundJS	*/
	if(chrome.runtime.connect){
		
		/* Connect width background.js	*/
		var status = chrome.runtime.connect({name: "status"});
		
		/*	Ask for conected user	*/
		status.postMessage({
			'status': null
		});
		
		status.onMessage.addListener(function(response){
			if(response.user){
				$scope.user = response.user;
				$("form[name='loginForm'] button[type='submit']").click();
			}
		})
	}
	
	/*	Login the user	*/
	$scope.loginUser = function(){
		var form = $scope.loginForm;
		
		if(form.$valid){
			$scope.user = {
				"name": form.userName.$modelValue,
				"location": form.userLocation.$modelValue
			}
			
			/*	Call the createLocation service	*/
			/*	services.createLocation($scope.user.location);	*/
			
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
	
	/*	Create Reclutation	*/
	$scope.createReclutation = function(){
		$scope.creatingReclutation = true;
	}
	$scope.decreaseMaxPlayers = function(){
		$scope.maxPlayers--;
	}
	$scope.increaseMaxPlayers = function(){
		$scope.maxPlayers++;
	}
	$scope.cancelReclutation = function(){
		$scope.creatingReclutation = false;
		
		$scope.description = "";
		$scope.maxPlayers = 4;
	}
	$scope.saveReclutation = function(){
		var form = $scope.reclutationForm;
		if(form.$valid){
			var data = {
				"description": form.description.$modelValue,
				"maxPlayers": $scope.maxPlayers,
				"location": $scope.user.location
			}
			var temp = new Reclutation(data);
			temp.addPlayer();
			$scope.reclutations.push(temp);
			
			if(chrome.runtime.connect){
				
				/* Connect width background.js	*/
				var create = chrome.runtime.connect({name: "create"});
				
				/*	Ask for conected user	*/
				create.postMessage({
					'create': temp
				});
				
				create.onMessage.addListener(function(response){
					
				});
			}
			
			$scope.cancelReclutation();
		}
	}
	
	var Reclutation = function(data){
		var self = this
		this.id = parseInt( Math.random() * 1000000 );
		this.description = data.description;
		this.location = data.location;
		this.maxPlayers = data.maxPlayers;
		this.players = new Array();
		
		this.addPlayer = function(){
			if(self.players.length < 4){
				self.players.push( $scope.user.name );
				$scope.user.waiting = true;
			}
		}
		
		this.removePlayer = function(){
			if(self.players.indexOf( $scope.user.name ) >= 0){
				self.players.splice( self.players.indexOf( $scope.user.name ), 1 );
				$scope.user.waiting = false;
			}
			
			if(self.players.length <= 0){
				for(var x in $scope.reclutations){
					if($scope.reclutations[x].id == self.id){
						$scope.reclutations.splice( x, 1 );
					}
				}
			}
		}
	};
}]);
