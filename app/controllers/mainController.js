teamUp.controller("mainCtrl", ['$scope', function($scope){
 
	/*	Init variables	*/
	$scope.username;
	$scope.reclutation = false;
	
	/*	Init function	*/
	$scope.isUser = false;
	
	
	$scope.loginUser = function(){
		$scope.user = $scope.name;
		$scope.isUser = true;
	}
	
	$scope.createReclutation = function(){
		
		$scope.reclutation = new Reclutation();
		$scope.reclutation.addPlayer($scope.user);
	}
	
	var Reclutation = function(){
		var self = this
		this.players = new Array();
		
		this.addPlayer = function(name){
			if(self.players.length < 4){
				self.players.push(name);
			}
		}
		
		this.removePlayer = function(name){
			if(self.players.indexOf(name)){
				self.players.splice( self.players.indexOf(name), 1 );
			}
			
			if(self.players.length <= 0){
				$scope.reclutation = false;
			}
		}
	};
}]);
