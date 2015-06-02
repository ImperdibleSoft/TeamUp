teamUp.directive('autoComplete' ,['services', function(services)  {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      myDirective: '&',
    },
    link: function (scope, element, attrs, ngModel) {
		var timing;
		
		$(element).on('keyup', function(){
			
			if($(element).val().length >= 4){
				clearTimeout(timing);
				timing = setTimeout(function(scope){
					
					var locations;
					services.getLocations().success(function(response){
						locations = response;
						
						$("#locationSuggestions").html("");
						for(var x in locations){
							
							var value = new RegExp( $(element).val() );
							if( value.test( locations[x] ) ){
								$("#locationSuggestions").append("<div class='mc-list-item'>"+ locations[x] +"</div>")
							}						
						}
						$("#locationSuggestions").show();
						
						$("#locationSuggestions .mc-list-item").on("click", function(){
							ngModel.$setViewValue( $(this).html() );
							$(element).val( $(this).html() );
							
							$("#locationSuggestions").html("");
							$("#locationSuggestions").hide();
						});
					});
				}, 500);
			}
		});
    }
  };
}]);