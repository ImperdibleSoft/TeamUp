/*	App start	*/
var appURL = "http://lordfido.github.io/TeamUp"
var user = false;
var reclutations = false;

/*	Initial conection, verify logged user	*/
chrome.runtime.onConnect.addListener(function(status){
	if(status.name == "status"){
		status.onMessage.addListener(function(response){
		
			/* Send user data */
			status.postMessage({
				'user': user
			});
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

/* Create conection, creates a new Reclutation */
chrome.runtime.onConnect.addListener(function(create){
	if(create.name == "create"){
		
		create.onMessage.addListener(function(response){
			
			$.ajax({
				type : 'post',
				url : appURL +'/APIs/public.php?action=createReclutation',
				dataType : 'json', 
				data : response.create,
				success : function(response2) {
					showNotification(response.create.id, "New Reclutation", "You have created a new reclutation named "+ response.create.description +", with "+ response.create.maxPlayers +"players");
					getNews();
				}
			});
			
			showNotification(response.create.id, "New Reclutation", "You have created a new reclutation named "+ response.create.description +", with "+ response.create.maxPlayers +"players");
			
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

/* Get reclutation list */
function getNews(){
	$.ajax({
		type : 'post',
		url : appURL +'/APIs/public.php?action=getReclutations',
		dataType : 'json', 
		data : {
			'location': user.location
		},
		success : function(response) {
			self.noerror = true;
			
			/* Alerta para mensajes */
			if(response.length > reclutations.length){
				/*	showNotification("New reclutation", "There are "+ response.length +" opened reclutations");	*/
			}
			reclutations = response;
			changeIcon(parseInt(response['mensajes']) + parseInt(response['notificaciones']));
		},
		complete : function(response) {
			// send a new ajax request when this request is finished
			if(!self.noerror) {
				
				// if a connection problem occurs, try to reconnect each 5 seconds
				setTimeout(function(){ getNews(); }, 5000);
			}else{

				// persistent connection
				getNews();
			}
			self.noerror = false;
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
