/*	App start	*/

	//var apiURL = "http://teamup.imperdiblesoft.com/APIs/public.php?action=";
	//var apiURL = "http://dev.teamup.imperdiblesoft.com/APIs/public.php?action=";
	var apiURL = "http://10.160.170.6/TeamUp/APIs/public.php?action=";

var user = false;
var recruitingsList = new Array();

/*	Initial conection, verify logged user	*/
chrome.runtime.onConnect.addListener(function(status){
	if(status.name == "status"){
		status.onMessage.addListener(function(response){
			
			console.log("Asking for status");
			
			/* Send user data */
			status.postMessage({
				'user': user,
				'recruitingsList': recruitingsList
			});
			
			console.log("Returning user and recruitingsList data");
			console.log(user);
			console.log(recruitingsList);
		});
	}
});

/*	Login conection, Logs in the user	*/
chrome.runtime.onConnect.addListener(function(login){
	if(login.name == "login"){
		login.onMessage.addListener(function(response){
		
			user = response.user;
			getNews();
		});
	}
});

/* Create conection, creates a new Recruiting */
chrome.runtime.onConnect.addListener(function(create){
	if(create.name == "create"){
		
		create.onMessage.addListener(function(response){
			
			console.log("Getting new recruiting");
			console.log(response.create);
			
			response.create.players = response.create.players.toString();
			
			$.ajax({
				method : 'POST',
				url : apiURL +'createRecruiting',
				dataType : 'json', 
				data : JSON.stringify( response.create ),
				success : function(response2) {

					recruitingsList = new Array();
					for(var x in response2.recruitings){
						response2.recruitings[x].id = response2.recruitings[x].id_recruiting;
						response2.recruitings[x].players = response2.recruitings[x].players.split(",");
						recruitingsList.push( response2.recruitings[x] );
					}
					
					showNotification("New Recruiting", "You have created a new recruiting named "+ response.create.description +", with "+ response.create.maxPlayers +"players", response.create.id);
					getNews();
				}
			});
			
			/*	Stores the new recruiting on the list	*/
			recruitingsList.push(response.create);
			
			console.log("Added to BackgroundJS recruitingsList");
			console.log(recruitingsList);
			
			/*	Send data to Extension UI	*/
			var recruitings = chrome.runtime.connect({name: "recruitings"});
			recruitings.postMessage({
				'recruitings': recruitingsList
			});
			
			console.log("Returning recruitingsList to UI");
			console.log(recruitingsList);
			
			/*	Show the notification	*/
			showNotification("New Recruiting", "You have created a new recruiting named "+ response.create.description +", with "+ response.create.maxPlayers +" players", response.create.id);
			
		});
	}
});

/*	Update recruiting, updates a recruiting	*/
chrome.runtime.onConnect.addListener(function(updateRecruiting){
	if(updateRecruiting.name == "updateRecruiting"){
		updateRecruiting.onMessage.addListener(function(response){
			
			console.log("Updating the recruiting with ID "+ response.recruiting.id);
			
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
					self.noerror = true;
					
					recruitingsList = new Array();
					for(var x in response.recruitings){
						response.recruitings[x].id = response.recruitings[x].id_recruiting;
						response.recruitings[x].players = response.recruitings[x].players.split(",");
						recruitingsList.push( response.recruitings[x] );
					}
					
					console.log("Returning new recruitingsList to UI");
					console.log(recruitingsList);
					
					updateRecruiting.postMessage({
						'recruitingsList': recruitingsList
					});
				}
			});
		});
	}
});

/*	RemoveRecruiting connection, delete a recruiting	*/
chrome.runtime.onConnect.addListener(function(removeRecruiting){
	if(removeRecruiting.name == "removeRecruiting"){
		removeRecruiting.onMessage.addListener(function(response){
			
			console.log("Removing recruiting with ID "+ response.id);
			
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
					self.noerror = true;
					
					recruitingsList = new Array();
					for(var x in response.recruitings){
						response.recruitings[x].id = response.recruitings[x].id_recruiting;
						response.recruitings[x].players = response.recruitings[x].players.split(",");
						recruitingsList.push( response.recruitings[x] );
					}
					
					console.log("Returning new recruitingsList to UI");
					console.log(recruitingsList);
							
					removeRecruiting.postMessage({
						'recruitingsList': recruitingsList
					});
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
	
	var data = {
		"location": user.location
	}
	
	$.ajax({
		type : 'post',
		url : apiURL +'getRecruitings',
		dataType : 'json', 
		data : JSON.stringify(data),
		success : function(response) {
			self.noerror = true;
			
			/* Alerta para mensajes */
			if(response.recruitings.length > recruitingsList.length){
				showNotification("New recruitings", "There are "+ response.recruitings.length +" opened recruitings", 1);
			}
			
			recruitingsList = new Array();
			for(var x in response.recruitings){
				response.recruitings[x].id = response.recruitings[x].id_recruiting;
				response.recruitings[x].players = response.recruitings[x].players.split(",");
				recruitingsList.push( response.recruitings[x] );
			}
			
			changeIcon( recruitingsList.length );
		},
		complete : function(response) {
			
			setTimeout(function(){ getNews(); }, 5000);
		}
	});
}

function changeIcon(param){
	if(param > 0){
		chrome.browserAction.setBadgeText({"text": String(param)});
	}else{
		chrome.browserAction.setBadgeText({"text": ''});
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
	var wkn = chrome.notifications;
	var notif = wkn.create(id+"", options);
}


