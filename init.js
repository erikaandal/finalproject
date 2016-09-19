var map;
var fromLocation;
var toLocation;
var toCoordinates;
var fromCoordinates;
var fromCity;
var toCity;
var state;

//gets parameter value in query string
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//calls maps api and weather with location name to return a json object with lat, lng, and weather
function getApiInfo(locationToGeocode)
{
	var result = new Object();
	var addressString = locationToGeocode.split(' ').join('+');
	console.log("address string: " + addressString);
	
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", "https://maps.googleapis.com/maps/api/geocode/json?address="+addressString+"&key=AIzaSyBYk0iIlcSE7p8n3buS4bcTznVhdj1YQYY", false);
	xmlHttp.send(null);
	result = JSON.parse(xmlHttp.responseText);
	JSONresult = result.results[0].geometry.location
	
	
	for(var key=0 in result.results[0].address_components)
	{
		if(result.results[0].address_components[key].types[0] == "locality")
			JSONresult["city"] = result.results[0].address_components[key].long_name.split(' ').join('_');
	}	
	
	for(var key=0 in result.results[0].address_components)
	{
		if(result.results[0].address_components[key].types[0] == "administrative_area_level_1")
			JSONresult["state"] = result.results[0].address_components[key].short_name;
	}	
	
	var xmlHttp = new XMLHttpRequest();
	var url = "http://api.wunderground.com/api/8a617756641e74e9/conditions/q/"+JSONresult.state+"/"+JSONresult.city+".json"
	xmlHttp.open("GET", url, false);
	xmlHttp.send(null);
	result = JSON.parse(xmlHttp.responseText);
	console.log(url);
	console.log("weather Info" + JSON.stringify(result));
	JSONresult["weather"] = result.current_observation.temperature_string;
	
	console.log("Jsonresult: " + JSON.stringify(JSONresult));
	
	return JSONresult;
}

//init function. Uses information from getApiInfo to construct google map route from start point to end point. Populates html field with location and weather.
function initMap() 
{
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: -34.397, lng: 150.644},
	  zoom: 8
	});
	
	toLocation = getParameterByName('toLocation');
	fromLocation = getParameterByName('fromLocation');
	
	toCoordinates = getApiInfo(toLocation);
	fromCoordinates = getApiInfo(fromLocation);
	toCity = toCoordinates.city;
	fromCity = fromCoordinates.city;
		
	console.log("toCoordinates: " + toCoordinates.lat + " " + toCoordinates.lng);
	console.log("fromCoordinates: " + fromCoordinates.lat + " " + fromCoordinates.lng);
	
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();
	
	var start = new google.maps.LatLng(toCoordinates.lat, toCoordinates.lng);
	var end = new google.maps.LatLng(fromCoordinates.lat, fromCoordinates.lng);
	
	var bounds = new google.maps.LatLngBounds();
	bounds.extend(start);
	bounds.extend(end);	
	map.fitBounds(bounds);
	
	var request = {
		origin: start,
		destination: end,
		travelMode: google.maps.TravelMode.DRIVING
	};
	
	directionsService.route(request, function(response, status){
		if(status == google.maps.DirectionsStatus.OK){
				directionsDisplay.setDirections(response);
				directionsDisplay.setMap(map);
			} else {
				alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
			}
		});
	
	document.getElementById('startLocation').innerHTML = fromLocation;
	document.getElementById('endLocation').innerHTML = toLocation;
	document.getElementById('startWeather').innerHTML = fromCoordinates.weather;
	document.getElementById('endWeather').innerHTML = toCoordinates.weather;
}
