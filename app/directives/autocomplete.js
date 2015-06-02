teamUp.directive('autoComplete' ,['services', function(services)  {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      myDirective: '&',
    },
    link: function (scope, element, attrs, ngModel) {
		var timing;
		
		var locations;
		services.getLocations().success(function(response){
			locations = response.locations;
		});
		
		$(element).on('keyup', function(){
			
			if($(element).val().length >= 4){
				
				$("#locationSuggestions").html("");
				for(var x in locations){
					
					var value = new RegExp( $(element).val() );
					if( value.test( locations[x].name ) ){
						$("#locationSuggestions").append("<div class='mc-list-item'>"+ locations[x].name +"</div>")
					}
				}
				
				if($("#locationSuggestions").children().length >= 1){
					$("#locationSuggestions").show();
				}
				else{
					$("#locationSuggestions").hide();
				}
				
				$("#locationSuggestions .mc-list-item").on("click", function(){
					ngModel.$setViewValue( $(this).html() );
					$(element).val( $(this).html() );
					
					$("#locationSuggestions").html("");
					$("#locationSuggestions").hide();
				});
			}
			else{
				$("#locationSuggestions").html("");
				$("#locationSuggestions").hide();
			}
		});
    }
  };
}]);