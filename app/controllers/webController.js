teamUp.controller("webCtrl", ['$scope', '$location', 'services', function($scope, $location, services){
 
	/*	Redirects to Extension view	*/
	var forceExtension = false;
	if(location.protocol == "chrome-extension:" || forceExtension){
		$location.url("/extension");
	}
	
	/*	Load the web controller	*/
	else{
		
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
		
		$scope.isChromeBrowser = conf.isChromeBrowser();
		
		/*	Functions declaration	*/
		/*	Init function	*/
		$scope.init = function(){
			
			/*	Change the layout	*/
			$("body").attr("mc-layout", "front");
			
			/*	Hide the "Back" button	*/
			$("#backBtn").hide();
			
			/*	Remove permanent notification	*/
			$(".mc-notification-container").html("");
			
			/*	Get AppVersion	*/
			services.getAppVersion().success(function(response){
				$scope.appVersion = response.version;
				$("#appVersion").html($scope.appVersion);
			});
			
			/*	Scroll to top	*/
			$("body").animate({
				"scrollTop": 0
			}, "normal");
		
		}
		
		$("#installExtension").on("click", function(){
			
			/*	If we are on Chrome, install the extension	*/
			if($scope.isChromeBrowser){
				var url = $("link[rel='chrome-webstore-item']").attr("href");
				chrome.webstore.install(url, 
				
				function(response){
					$("#installExtension").html("Installed");
					$("#installExtension").removeClass("mc-bg-darkred");
					$("#installExtension").addClass("mc-bg-green");
					$("#installExtension").attr("mc-action", "done");
					
				}, function(error){
					
					$("#installExtension").html("Retry");
					$("#installExtension").removeClass("mc-bg-green");
					$("#installExtension").addClass("mc-bg-darkred");
					$("#installExtension").attr("mc-action", "refresh");
				});
			}
			
			/*	If we are not in chrome, go to Chrome Web Store	*/
			else{
				window.open("https://chrome.google.com/webstore/detail/team-up/ggodlfmnafpmahoddgdlngfnhnkfnedj");
			}
		});
		
		$scope.init();
	}
}]);
