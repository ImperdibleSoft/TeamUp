/*	App start	*/

//var apiURL = "http://teamup.imperdiblesoft.com/APIs/public.php?action="
var apiURL = "http://dev.teamup.imperdiblesoft.com/APIs/public.php?action="

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
			
			$.ajax({
				type : 'post',
				url : apiURL +'createRecruiting',
				dataType : 'json', 
				data : response.create,
				success : function(response2) {
					
					recruitingsList.push(response);
					
					showNotification(response.create.id, "New Recruiting", "You have created a new recruiting named "+ response.create.description +", with "+ response.create.maxPlayers +"players");
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
			showNotification(response.create.id, "New Recruiting", "You have created a new recruiting named "+ response.create.description +", with "+ response.create.maxPlayers +" players");
			
		});
	}
});

/*	Update recruiting, updates a recruiting	*/
chrome.runtime.onConnect.addListener(function(updateRecruiting){
	if(updateRecruiting.name == "updateRecruiting"){
		updateRecruiting.onMessage.addListener(function(response){
			
			console.log("Updating the recruiting with ID "+ response.recruiting.id);
			
			for(var x in recruitingsList){
				if(response.recruiting.id == recruitingsList[x].id){
					recruitingsList[x] = response.recruiting;
				}
			}
			
			console.log("Returning new recruitingsList to UI");
			console.log(recruitingsList);
			
			updateRecruiting.postMessage({
				'recruitingsList': recruitingsList
			})
			
		});
	}
});

/*	RemoveRecruiting connection, delete a recruiting	*/
chrome.runtime.onConnect.addListener(function(removeRecruiting){
	if(removeRecruiting.name == "removeRecruiting"){
		removeRecruiting.onMessage.addListener(function(response){
			
			console.log("Removing recruiting with ID "+ response.id);
			
			for(var x in recruitingsList){
				if(response.id == recruitingsList[x].id){
					recruitingsList.splice( x, 1 );
				}
			}
			
			console.log("Returning new recruitingsList to UI");
			console.log(recruitingsList);
			
			removeRecruiting.postMessage({
				'recruitingsList': recruitingsList
			})
			
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
	
	$.ajax({
		type : 'post',
		url : apiURL +'getRecruitings',
		dataType : 'json', 
		data : {
			'location': user.location
		},
		success : function(response) {
			self.noerror = true;
			
			/* Alerta para mensajes */
			if(response.length > recruitingsList.length){
				/*	showNotification("New recruiting", "There are "+ response.length +" opened recruitings");	*/
			}
			recruitingsList = response;
			
			changeIcon(parseInt(response['mensajes']) + parseInt(response['notificaciones']));
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
function showNotification(id, title, msg){

	var options = {
		"type": "basic",
		"title": title,
		"message": msg,
		"iconUrl": "/images/logo_128.png"
	}
	var wkn = chrome.notifications;
	var notif = wkn.create(id+"", options);
}
