/* Se inicia la aplicación */
var logeado = false;
var mi_usuario = "";
var alerta = new Array();
alerta['favores'] = 0;
alerta['mensajes'] = 0;

/* Conexión inicial, informa a la interfaz si el usuario está logeado */
chrome.runtime.onConnect.addListener(function(estado){
	if(estado.name == "estado"){
		estado.onMessage.addListener(function(response){
		
			/* Envía el estado del usuario */
			if(logeado == false){
				estado.postMessage({
					'estado': 'No',
					'codigo': 0
				});
			}else{
				estado.postMessage({
					'estado': 'Si',
					'codigo': 1,
					'usuario': mi_usuario,
					'favores': alerta['favores'],
					'mensajes': alerta['mensajes']
				});
			}
		});
	}
});

/* Conexión login, inicia sesión */
chrome.runtime.onConnect.addListener(function(login){
	if(login.name == "login"){
		login.onMessage.addListener(function(response){
		
			/* Se comparan los datos del login */
			mi_usuario = response.usuario;
			logeado = true;
			obtener_novedades();
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

/* Si hay sesión iniciada, consulta notificaciones de favores y mensajes */
function obtener_novedades(){
	if(mi_usuario.id_Usuario){
		$.ajax({
			type : 'get',
			url : 'http://www.imperdiblesoft.com/funciones/ajax/notificaciones.php',
			dataType : 'json', 
			data : {
				'usuario': mi_usuario.id_Usuario,
				'src': 'ext'
			},
			success : function(response) {
				self.noerror = true;
				
				console.log(mi_usuario.notificaciones);
				
				/* Colocar notificaciones en sus iconos */
				/* Alerta para favores */
				if(alerta['favores'] < response['notificaciones'] && alerta['favores'] != null && mi_usuario.notificaciones == '1'){
					$.ajax({
						type : 'get',
						url : 'http://www.imperdiblesoft.com/funciones/ajax/notificaciones.php',
						dataType : 'json', 
						data : {
							'usuario' : mi_usuario.id_Usuario,
							'notificaciones' : (response['notificaciones'] - alerta['favores'])
						},
						success : function(response) {
							self.noerror = true;
							for(var x in response){
								showNotification("Novedades en SxN", response[x]['motivo'], "http://www.imperdiblesoft.com/img/logo-sxn.png", response[x]['url']);
							}
						},
						complete : function(response) {
							// send a new ajax request when this request is finished
							if(!self.noerror) {
								
								// if a connection problem occurs, try to reconnect each 5 seconds
								setTimeout(function(){ obtener_novedades(); }, 5000);
							}else{

								// persistent connection
								obtener_novedades();
							}
							self.noerror = false;
						}
					});
				}
				alerta['favores'] = response['notificaciones'];
				
				/* Alerta para mensajes */
				if(alerta['mensajes'] < response['mensajes'] && alerta['mensajes'] != null && mi_usuario.notificaciones == '1'){
					showNotification("Nuevo mensaje privado", "Tienes "+response['mensajes']+" nuevo/s mensaje/s privado/s en Solidarios por Naturaleza", "http://www.imperdiblesoft.com/img/logo-sxn.png", "index.php?seccion=mensajes");
				}
				alerta['mensajes'] = response['mensajes'];
				cambiar_icono(parseInt(response['mensajes']) + parseInt(response['notificaciones']));
			},
			complete : function(response) {
				// send a new ajax request when this request is finished
				if(!self.noerror) {
					
					// if a connection problem occurs, try to reconnect each 5 seconds
					setTimeout(function(){ obtener_novedades(); }, 5000);
				}else{

					// persistent connection
					obtener_novedades();
				}
				self.noerror = false;
			}
		});
	}
}

function cambiar_icono(parametro){
	if(parametro > 0){
		chrome.browserAction.setBadgeText({"text": String(parametro)});
	}else{
		chrome.browserAction.setBadgeText({"text": ''});
	}
}

/* Función para crear notificaciones */
function showNotification(title, msg, icon, url_notificacion){

	/* Escanea las ventanas en busca de alguna abierta */
	var ventanas = new Array();
	var objetivo = new Array();
	chrome.windows.getAll({"populate" : true}, function(windows){
		for(var i = 0; i < windows.length; i++){
			ventanas[i] = windows[i];
		}
		
		/* Hay ventanas abiertas */
		if(ventanas.length >= 1){
			objetivo['abierto'] = true;
			
		/* No hay ventanas abiertas */
		}else{
			objetivo['abierto'] = false;
		}
		
		/* Escanea las pestañas en busca de nuestra web */
		var pestanas = new Array();
		chrome.tabs.query({}, function(tabs){
			for(var i = 0; i < tabs.length; i++){
				pestanas[i] = tabs[i];
			}
			
			for(var i = 0; i < pestanas.length; i++){
				if(/imperdiblesoft/.test(pestanas[i].url)){
					objetivo['tab_window'] = pestanas[i].windowId ;
					objetivo['tab_id'] = pestanas[i].id;
					objetivo['tab_index'] = pestanas[i].index;
					objetivo['tab_url'] = pestanas[i].url;
				}
			}
		
			/* Actúa */
			var url_absoluta = 'http://www.imperdiblesoft.com/'+url_notificacion;
			
			if(!objetivo['abierto'] || objetivo['abierto'] == false || !objetivo['tab_url'] || objetivo['tab_url'] != url_absoluta){
					if(window.webkitNotifications){
					var wkn = window.webkitNotifications;
					var notif;
					if(wkn.checkPermission() == 0){
						notif = wkn.createNotification(icon, title, msg);
						notif.onclick = function(){
							cargar_web('http://www.imperdiblesoft.com/'+url_notificacion);
							notif.cancel();
						};
						notif.show();
					}
				}
			}
		});
	});
}
