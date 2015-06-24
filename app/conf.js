var conf = {
	"online": true,
	"debugging": false,
	
	"apiURL": function(){
		
		/*	Production enviroment	*/
		if(conf.online && !conf.debugging){
			return "http://www.my-teamup.com/APIs/public.php?action=";
		}
		
		/*	Development enviroment	*/
		else if(conf.online && conf.debugging){
			return "http://dev.my-teamup.com/APIs/public.php?action=";
		}
		
		/*	Local enviroment	*/
		else{
			return "APIs/public.php?action=";
		}
	},
	
	"minutesToWaitBetweenChecks": 0.5,
	
	"showNotification": function(title, msg, id, shouldVibrate){
	
		var autoclose = 8000;
		var options = {
			"type": "basic",
			"title": title,
			"message": msg,
			"iconUrl": "images/logo_128.png"
		}
		var num = parseInt( Math.random() * 1000000 );
		
		if(location.protocol == "chrome-extension:" || Notification.permission == "granted"){
			var title = options.title;
			var extra = {
				icon: options.iconUrl,
				body: options.message
			}
			
			/*	Try to create a notification	*/
			try {  
				var chromeNotify = new Notification(title, extra);
				if(autoclose != false && autoclose >= 1){
					setTimeout(function(){
						chromeNotify.close() ;
					}, autoclose);
				}
				
			/*	On error, create a normal notification	*/
			} catch (e) {  
				var notif = "<div id='"+ id +"' class='mc-notification'>";
					notif += "<p class='mc-text'>";
						if(options.title){
							notif += options.title +" - ";
						}
						notif += options.message;
					notif += "</p>";
				notif += "</div>";
				$(".mc-notification-container").append( notif );
				
				setTimeout(function(){
					$("#"+ id +".mc-notification").fadeOut("normal", function(){
						$(this).remove();
					});
				}, autoclose);
			} 
		}
		else{
			
			var notif = "<div id='"+ id +"' class='mc-notification'>";
				notif += "<p class='mc-text'>";
					if(options.title){
						notif += options.title +" - ";
					}
					notif += options.message;
				notif += "</p>";
			notif += "</div>";
			$(".mc-notification-container").append( notif );
			
			setTimeout(function(){
				$("#"+ id +".mc-notification").fadeOut("normal", function(){
					$(this).remove();
				});
			}, autoclose);
		}
		
		if(window.navigator.vibrate && shouldVibrate === true){
			window.navigator.vibrate([400, 300, 300]);
		}
		
		var notification = document.getElementById("notificationSound");
		if(!notification){
			$("body").append('<div style="display:none"><audio id="notificationSound"><source src="media/notification.mp3" type="audio/mpeg"></audio></div>');
			var notification = document.getElementById("notificationSound");
		}
		if(notification.Play){
			notification.Play();
		}else{
			notification.play();
		}
	},
	
	"createCustomSearch": function(){
		debug("Success");
	},
	
	"isChromeBrowser": function(){
		if(/chrome/.test(navigator.userAgent.toLowerCase()) && (/windows/.test(navigator.userAgent.toLowerCase()) || (/linux/.test(navigator.userAgent.toLowerCase()) && /android/.test(navigator.userAgent.toLowerCase()) == false) || (/os x/.test(navigator.userAgent.toLowerCase()) && /iphone/.test(navigator.userAgent.toLowerCase()) == false && /ipad/.test(navigator.userAgent.toLowerCase()) == false))){
			return true;
		}
		else{
			return false;
		}
	},
	
	"debug": function(param){
		if(conf.debugging === true){
			console.log(param);
		}
	}
}
