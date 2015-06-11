/*	App start	*/
	
/*	Init variables	*/
var error = false;
var viewAllRecruitings = false;

var user = false;

var waiting = false;
var notificationCount = 0;

var recruitingsList = new Array();

/*	Custom search engine	*/
chrome.omnibox.onInputStarted.addListener(function(){
	conf.debug("Now you are searching");
});

chrome.omnibox.onInputChanged.addListener(function(text, suggest){
	
	/*	Event triggered when the omnibox change	*/
	conf.debug("You changed the text to: "+ text);
	
	/*	Create a suggestion list based on text	*/
	var suggestions = new Array();
	suggestions.push( new SuggestResult("Hola", "Esto es un saludo") );
	suggestions.push( new SuggestResult("Adios", "Esto es una despedida") );
	
	/*	Return the suggestion list to the UI	*/
	suggest(suggestions);
	
});

chrome.omnibox.onInputEntered.addListener(function(text, disposition){
	
	/*	Event triggered when the search is completed/executed	*/
	conf.debug("You finished your search: "+ text);
	
	/**
	/*	Choose how to display results
	/*
	/*	currentTab
	/*	newForegroundTab
	/*	newBackgroundTab
	*/
	disposition = "newForegroundTab";
});

chrome.omnibox.onInputCancelled.addListener(function(){
	conf.debug("You cancelled your search");
});

var SuggestResult = function(content, description){
	this.content = content;
	this.description = description;
};


/*	Extension Logic	*/
/*	Status connection, verify logged user	*/
chrome.runtime.onConnect.addListener(function(status){
	if(status.name == "status"){
		status.onMessage.addListener(function(response){
			
			conf.debug("Asking for status");
			
			/* Send user data */
			status.postMessage({
				'user': user,
				'recruitings': recruitingsList
			});
			
			conf.debug("Returning user and recruitingsList data");
			conf.debug(user);
			conf.debug(recruitingsList);
		});
	}
});

/*	Login conection, Logs in the user	*/
chrome.runtime.onConnect.addListener(function(login){
	if(login.name == "login"){
		login.onMessage.addListener(function(response){
			
			/*	Save user data	*/
			if(response.user){
				user = response.user;
			}
			
			/*	Create a new location	*/
			if(response.createLocation){
				$.ajax({
					method : 'POST',
					url : conf.apiURL() +'createLocation',
					dataType : 'json', 
					data : JSON.stringify({'name': response.user.location}),
					success: function(response2){
						connectionRestored();
					},
					error: function(connection, text, error){
						var temp = {
							"connection": connection,
							"text": text,
							"error": error
						}
						connectionError(temp);
					}
				});
			}
			
			getNews();
		});
	}
});

/*	Logout conection, Logs out the user	*/
chrome.runtime.onConnect.addListener(function(logout){
	if(logout.name == "logout"){
		logout.onMessage.addListener(function(response){
			user = response.user;
			changeIcon(0);
		});
	}
});

/* Create conection, creates a new Recruiting */
chrome.runtime.onConnect.addListener(function(create){
	if(create.name == "create"){
		
		create.onMessage.addListener(function(response){
			
			conf.debug("Creating new recruiting");
			conf.debug(response.create);
			
			$.ajax({
				method : 'POST',
				url : conf.apiURL() +'createRecruiting',
				dataType : 'json', 
				data : JSON.stringify( response.create ),
				success : function(response2) {
					connectionRestored();
					
					conf.debug("Getting the recruitingsList from BackgroundJS");
					conf.debug(response2.recruitings);
					
					parseRecruitingsList(response2.recruitings);
					
					conf.debug("recruitingsList parsed");
					conf.debug(recruitingsList);
					
					create.postMessage({
						"recruitings": recruitingsList
					});
					
				},
				error: function(connection, text, error){
					var temp = {
						"connection": connection,
						"text": text,
						"error": error
					}
					connectionError(temp);
				}
			});
			
			/*	Stores the new recruiting on the list	*/
			recruitingsList.push(response.create);
			
			conf.debug("Added to BackgroundJS recruitingsList");
			conf.debug(recruitingsList);
			
			/*	Send data to Extension UI	*/
			var recruitings = chrome.runtime.connect({name: "recruitings"});
			recruitings.postMessage({
				'recruitings': recruitingsList
			});
			
			conf.debug("Returning recruitingsList to UI");
			conf.debug(recruitingsList);
		});
	}
});

/*	Update recruiting, updates a recruiting	*/
chrome.runtime.onConnect.addListener(function(updateRecruiting){
	if(updateRecruiting.name == "updateRecruiting"){
		updateRecruiting.onMessage.addListener(function(response){
			
			conf.debug("Updating the recruiting with ID "+ response.recruiting.id);
			
			if(response.recruiting.players.indexOf( user.name ) >= 0){
				waiting = true;
			}
			else{
				waiting = false;
			}
			response.recruiting.players = response.recruiting.players.toString();
			
			var data = {
				"id": response.recruiting.id,
				"description": response.recruiting.description,
				"location": response.recruiting.location,
				"maxPlayers": response.recruiting.maxPlayers,
				"players": response.recruiting.players
			};
			
			$.ajax({
				type : 'post',
				url : conf.apiURL() +'updateRecruiting',
				dataType : 'json', 
				data : JSON.stringify(data),
				success : function(response) {
					connectionRestored();
					
					if(response.recruitings){
						parseRecruitingsList(response.recruitings);
						
						/* Create updateRecruitings connection	*/
						var updateRecruitings = chrome.runtime.connect({name: "updateRecruitings"});
						
						updateRecruiting.postMessage({
							"recruitings": recruitingsList
						});
					}
				},
				error: function(connection, text, error){
					var temp = {
						"connection": connection,
						"text": text,
						"error": error
					}
					connectionError(temp);
				}
			});
		});
	}
});

/*	setViewAllRecruitings connection, change the user preference	*/
chrome.runtime.onConnect.addListener(function(setViewAllRecruitings){
	if(setViewAllRecruitings.name == "setViewAllRecruitings"){
		setViewAllRecruitings.onMessage.addListener(function(response){
			
			conf.debug("Changing user preference. setViewAllRecruitings="+ response.viewAllRecruitings);
			viewAllRecruitings = response.viewAllRecruitings;
		});
	}
});

/*	Parse a list of objects into a list of Recruitings	*/
var parseRecruitingsList = function(param){
	waiting = false;
	var tempRecruitingsList = new Array();

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
		if(param[x].difference >= 2100 || param[x].players.length <= 0){
			var data = {
				'id': param[x].id,
				'location': user.location
			}
			
			param[x].cancelled = true;
			
			tempRecruitingsList.push( param[x] );
		}
		
		/*	If has the correct time and has players	*/
		else{
			
			var temp1 = param[x];
			var alreadyNotified = false;
			var remainingPlayers = false;
			
			/*	Verify already checked elements	*/
			for(var y in recruitingsList){
				var temp2 = recruitingsList[y];
				
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
						showNotification("New recruiting", "There is a new recruiting for \""+ temp1.description +"\",  "+ remainingPlayers +" players remaining", temp1.id, false);
					}
				}
				else if(remainingPlayers !== false){
					if(remainingPlayers > 0){
						showNotification("Recruiting update", "There are only "+ remainingPlayers +" players remaining for \""+ temp1.description +"\"", temp1.id, false);
					}
					else{
						showNotification("Recruiting update", "All players for \""+ temp1.description +"\" are ready. Let's go!'", temp1.id, false);
					}
				}
			}
		
			/*	Set the match as completed	*/
			if(temp1.players.length >= temp1.maxPlayers && temp1.completed != "1"){
				conf.debug("Completing recruiting with ID "+ temp1.id);
				
				var data = {
					"id": temp1.id,
					"location": user.location
				};
				param[x].completed = true;
			}
			
			/*	Add players to the recruiting	*/
			for(var y in temp1.players){
				
				if(temp1.players[y] == user.name && temp1.completed == false){
					waiting = true;
					temp1.myRecruiting = true;
				}
			}
			
			tempRecruitingsList.push( temp1 );
		}
	}

	recruitingsList = tempRecruitingsList;
}

/* Get recruiting list */
function getNews(){
	
	if(user){
		var data = {
			"location": user.location
		}
		
		$.ajax({
			type : 'post',
			url : conf.apiURL() +'getRecruitings',
			dataType : 'json', 
			data : JSON.stringify(data),
			success : function(response) {
				connectionRestored();
				
				parseRecruitingsList( response.recruitings );
				
				/* Create updateRecruitings connection	*/
				var updateRecruitings = chrome.runtime.connect({name: "updateRecruitings"});
				
				/*	Send recruitings to UI	*/
				updateRecruitings.postMessage({
					'recruitings': recruitingsList
				});
				
				changeIcon( notificationCount );
			},
			complete : function(response) {
					setTimeout(function(){ getNews(); }, conf.minutesToWaitBetweenChecks * 1000 * 60);
			},
			error: function(connection, text, error){
				var temp = {
					"connection": connection,
					"text": text,
					"error": error
				}
				connectionError(temp);
			}
		});
	}
}

/*	Change the icon	*/
function changeIcon(param){
	if(param > 0){
		chrome.browserAction.setBadgeText({"text": String(param)});
	}else{
		chrome.browserAction.setBadgeText({"text": ''});
	}
}

/*	Verify if this recruiting notification should be shown	*/
function shouldShowThisNotification(recruiting){
	
	if((!waiting || recruiting.players.indexOf(user.name) >= 0 || viewAllRecruitings) && (!recruiting.completed || recruiting.completed == '0') && ( !recruiting.cancelled || recruiting.cancelled== '0')){
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

function connectionError(param){
	if(error == false){
		var num = parseInt( Math.random() * 1000000 );
		showNotification("Connection error", "There was a connection error. Please, wait a few minutes while we try to solve the problem.", num);
	}
	error = param;
	
	/* Create connError connection	*/
	var connError = chrome.runtime.connect({name: "connError"});
	
	/*	Send the error	*/
	connError.postMessage({
		'error': error
	});
}

function connectionRestored(){
	if(error != false){
		var num = parseInt( Math.random() * 1000000 );
		showNotification("Connection restored", "Good news, the connection was restored!", num);
	}
	error = false;
	
	/* Create connError connection	*/
	var connError = chrome.runtime.connect({name: "connError"});
	
	/*	Send the error	*/
	connError.postMessage({
		'error': error
	});
}



