$(document).ready(function(){
	
	function disableButton(){
		
		if( $("#installExtension").length >= 1 ){
			
			conf.debug("App installed, disabling 'Install' button");
			
			$("#installExtension").html("Installed");
			$("#installExtension").addClass("mc-bg-green");
			$("#installExtension").attr("mc-action", "done");
			
			$("#installExtension").parent(".mc-notification").remove();
		}
		else{
			setTimeout(function(){
				
				disableButton();
			}, 1000);
		}
	}
	
	disableButton();
});