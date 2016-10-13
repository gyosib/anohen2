/*
;(function($) {
	$.fn.get_location = function(){
		alert("You could access this page!");
		if(navigator.geolocation){
			navigator.geolocation.watchPosition(function(position){
				console.log(position);
				alert("I'm getting your location");
				var gx = position.coords.longitude;
				var gy = position.coords.latitude;
				$.cookie("gps_x",gx);
				$.cookie("gps_y",gy);
				alert("your location is "+gx+","+gy);
			});
		}else{
			alert("Sorry, but Your device cannot use GPS");
		}
	}
})(jQuery);
*/


function get_location(){
	alert("You could access this page!");
	if(navigator.geolocation){
		navigator.geolocation.watchPosition(function(position){
			console.log(position);
			alert("I'm getting your location");
			var gx = position.coords.longitude;
			var gy = position.coords.latitude;
			$.cookie("gps_x",gx);
			$.cookie("gps_y",gy);
			alert("your location is "+gx+","+gy);
		});
	}else{
		alert("Sorry, but Your device cannot use GPS");
	}
}
