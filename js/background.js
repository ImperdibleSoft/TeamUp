/*	App start	*/

	var apiURL = "http://teamup.imperdiblesoft.com/APIs/public.php?action=";
	//var apiURL = "http://dev.teamup.imperdiblesoft.com/APIs/public.php?action=";
	//var apiURL = "http://10.160.170.6/TeamUp/APIs/public.php?action=";
	//var apiURL = "http://localhost/TeamUp/APIs/public.php?action=";

var user = false;
var recruitingsList = new Array();
var viewAllRecruitingsOption = false;
var notificationCount = 0;
var errors = false;
var debugging = false;

/*	Initial conection, verify logged user	*/
chrome.runtime.onConnect.addListener(function(status){
	if(status.name == "status"){
		status.onMessage.addListener(function(response){
			
			debug("Asking for status");
			
			/* Send user data */
			status.postMessage({
				'user': user,
				'recruitingsList': recruitingsList,
				'viewAllRecruitings': viewAllRecruitingsOption,
				'error': errors
			});
			
			debug("Returning user and recruitingsList data");
			debug(user);
			debug(recruitingsList);
		});
	}
});

/*	viewAllRecruitings connection, change the user preference	*/
chrome.runtime.onConnect.addListener(function(viewAllRecruitings){
	if(viewAllRecruitings.name == "viewAllRecruitings"){
		viewAllRecruitings.onMessage.addListener(function(response){
			
			debug("Changing user preference. viewAllRecruitings="+ response.viewAllRecruitings);
			viewAllRecruitingsOption = response.viewAllRecruitings;
		});
	}
});

/*	Login conection, Logs in the user	*/
chrome.runtime.onConnect.addListener(function(login){
	if(login.name == "login"){
		login.onMessage.addListener(function(response){
			user = response.user;
			
			if(response.createLocation){
				$.ajax({
					method : 'POST',
					url : apiURL +'createLocation',
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
			
			debug("Getting new recruiting");
			debug(response.create);
			
			response.create.players = response.create.players.toString();
			
			$.ajax({
				method : 'POST',
				url : apiURL +'createRecruiting',
				dataType : 'json', 
				data : JSON.stringify( response.create ),
				success : function(response2) {
					connectionRestored();
					
					recruitingsList = new Array();
					for(var x in response2.recruitings){
						response2.recruitings[x].id = response2.recruitings[x].id_recruiting;
						response2.recruitings[x].players = response2.recruitings[x].players.split(",");
						recruitingsList.push( response2.recruitings[x] );
					}
					
					/*	Show the notification	*/
					showNotification("New Recruiting", "You have created a new recruiting named "+ response.create.description +", with "+ response.create.maxPlayers +" players", response.create.id);
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
			
			debug("Added to BackgroundJS recruitingsList");
			debug(recruitingsList);
			
			/*	Send data to Extension UI	*/
			var recruitings = chrome.runtime.connect({name: "recruitings"});
			recruitings.postMessage({
				'recruitings': recruitingsList
			});
			
			debug("Returning recruitingsList to UI");
			debug(recruitingsList);
		});
	}
});

/*	Update recruiting, updates a recruiting	*/
chrome.runtime.onConnect.addListener(function(updateRecruiting){
	if(updateRecruiting.name == "updateRecruiting"){
		updateRecruiting.onMessage.addListener(function(response){
			
			debug("Updating the recruiting with ID "+ response.recruiting.id);
			
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
				url : apiURL +'updateRecruiting',
				dataType : 'json', 
				data : JSON.stringify(data),
				success : function(response) {
					connectionRestored();
					
					recruitingsList = new Array();
					for(var x in response.recruitings){
						response.recruitings[x].id = response.recruitings[x].id_recruiting;
						response.recruitings[x].players = response.recruitings[x].players.split(",");
						recruitingsList.push( response.recruitings[x] );
					}
					
					debug("Returning new recruitingsList to UI");
					debug(recruitingsList);
					
					updateRecruiting.postMessage({
						'recruitingsList': recruitingsList
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
		});
	}
});

/*	RemoveRecruiting connection, delete a recruiting	*/
chrome.runtime.onConnect.addListener(function(removeRecruiting){
	if(removeRecruiting.name == "removeRecruiting"){
		removeRecruiting.onMessage.addListener(function(response){
			
			debug("Removing recruiting with ID "+ response.id);
			
			var data = {
				"id": response.id,
				"location": user.location
			};
			
			$.ajax({
				type : 'post',
				url : apiURL +'removeRecruiting',
				dataType : 'json', 
				data : JSON.stringify(data),
				success : function(response) {
					connectionRestored();
					
					recruitingsList = new Array();
					for(var x in response.recruitings){
						response.recruitings[x].id = response.recruitings[x].id_recruiting;
						response.recruitings[x].players = response.recruitings[x].players.split(",");
						recruitingsList.push( response.recruitings[x] );
					}
					
					debug("Returning new recruitingsList to UI");
					debug(recruitingsList);
							
					removeRecruiting.postMessage({
						'recruitingsList': recruitingsList
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
		
		});
	}
});

/*	Recruitings conection, get the recruiting list	*/
chrome.runtime.onConnect.addListener(function(recruitings){
	if(recruitings.name == "recruitings"){
		recruitings.postMessage({
			'recruitings': recruitingsList ? recruitingsList : false
		});
	}
});

/* Conexión logout, cierra sesión */
chrome.runtime.onConnect.addListener(function(logout){
	if(logout.name == "logout"){
		
		logout.onMessage.addListener(function(response){
			logeado = false;
			mi_usuario = "";
			
			if(response.cerrar == true){
				cerrar_ventana();
			}
		});
	}
});

/* Get recruiting list */
function getNews(){
	
	if(user){
		var data = {
			"location": user.location
		}
		
		$.ajax({
			type : 'post',
			url : apiURL +'getRecruitings',
			dataType : 'json', 
			data : JSON.stringify(data),
			success : function(response) {
				connectionRestored();
				notificationCount = 0;
				
				/* Foreach recruiting*/
				for(var x in response.recruitings){
					
					/*	Parse data	*/
					response.recruitings[x].id = response.recruitings[x].id_recruiting;
					response.recruitings[x].players = response.recruitings[x].players.split(",");
					
					var temp1 = response.recruitings[x];
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
						}
					}
					
					/*	Show notification	*/
					if(shouldShowThisNotification(temp1)){
						notificationCount++;
						
						if(!alreadyNotified){
							remainingPlayers = temp1.maxPlayers - temp1.players.length;
							
							if(remainingPlayers > 0){
								showNotification("New recruiting", "There is a new recruiting for \""+ temp1.description +"\",  "+ remainingPlayers +" players remaining", temp1.id);
							}
						}
						else if(remainingPlayers !== false){
							if(remainingPlayers > 0){
								showNotification("Recruiting update", "There are only "+ remainingPlayers +" players remaining for \""+ temp1.description +"\"", temp1.id);
							}
							else{
								showNotification("Recruiting update", "All players for \""+ temp1.description +"\" are ready. Let's go!'", temp1.id);
							}
						}
					}
				
					/*	Set the match as completed	*/
					if(temp1.players.length >= temp1.maxPlayers && temp1.completed != "1"){
						debug("Completing recruiting with ID "+ temp1.id);
						
						var data = {
							"id": temp1.id,
							"location": user.location
						};
						
						$.ajax({
							type : 'post',
							url : apiURL +'completeRecruiting',
							dataType : 'json', 
							data : JSON.stringify(data),
							success : function(response) {
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
					
				}
				
				recruitingsList = response.recruitings;
				
				/* Create status connection	*/
				var updateRecruitings = chrome.runtime.connect({name: "recruitings"});
				
				/*	Send recruitings to UI	*/
				updateRecruitings.postMessage({
					'recruitings': recruitingsList
				});
				
				changeIcon( notificationCount );
			},
			complete : function(response) {
					setTimeout(function(){ getNews(); }, 5000);
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
	if((recruiting.players.indexOf(user.name) >= 0 || viewAllRecruitingsOption) && !recruiting.completed && !recruiting.cancelled){
		return true;
	}
	else{
		return false;
	}
}

/*	Creates a new Notification	*/
function showNotification(title, msg, id){

	var options = {
		"type": "basic",
		"title": title,
		"message": msg,
		"iconUrl": "/images/logo_128.png"
	}
	var num = parseInt( Math.random() * 1000000 );
	var wkn = chrome.notifications;
	var notif = wkn.create(num+"", options);
}

function connectionError(param){
	if(errors == false){
		var num = parseInt( Math.random() * 1000000 );
		showNotification("Connection error", "There was a connection error. Please, wait a few minutes while we try to solve the problem.", num);
	}
	errors = param;
	
	/* Create connError connection	*/
	var connError = chrome.runtime.connect({name: "connError"});
	
	/*	Send the error	*/
	connError.postMessage({
		'error': errors
	});
}

function connectionRestored(){
	if(errors != false){
		var num = parseInt( Math.random() * 1000000 );
		showNotification("Connection restored", "Good news, the connection was restored!", num);
	}
	errors = false;
	
	/* Create connError connection	*/
	var connError = chrome.runtime.connect({name: "connError"});
	
	/*	Send the error	*/
	connError.postMessage({
		'error': errors
	});
}

function debug(param){
	if(debugging == true){
		console.log(param);
	}
}




