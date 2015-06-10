var conf = {
	"debugging": true,
	
	"apiURL": function(){
		if(conf.debugging){
			return "http://192.168.0.10/TeamUp/APIs/public.php?action=";
		}
		else{
			return "http://teamup.imperdiblesoft.com/APIs/public.php?action=";
		}
	},
	
	"minutesToWaitBetweenChecks": 0.5,
	
	"showNotification": function(title, msg, id, shouldVibrate){

		var autoclose = 8000;
		var options = {
			"type": "basic",
			"title": title,
			"message": msg,
			"iconUrl": "/images/logo_128.png"
		}
		var num = parseInt( Math.random() * 1000000 );
		
		if(location.protocol == "chrome-extension:"){
			var title = options.title;
			var extra = {
				icon: options.iconUrl,
				body: options.message
			}
			
			var chromeNotify = new Notification(title, extra);
			if(autoclose != false && autoclose >= 1){
				setTimeout(function(){
					chromeNotify.close() ;
				}, autoclose);
			}
			
		}else{
			
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
		
	},
	
	"debug": function(param){
		if(conf.debugging === true){
			console.log(param);
		}
	}
}
