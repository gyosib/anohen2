function get_location(){
	if(navigator.geolocation){
		navigator.geolocation.watchPosition(function(position){
			var gx = position.coords.longitude;
			var gy = position.coords.latitude;
			$.cookie("gps_x",gx);
			$.cookie("gps_y",gy);
		});
	}else{
		alert("Sorry, but Your device cannot use GPS");
	}
}
