  var geocoder;
  var map;
  var directionsDisplay;
  var directionsService = new google.maps.DirectionsService();
  var locations = [];

  var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
      var anHttpRequest = new XMLHttpRequest();
      anHttpRequest.onreadystatechange = function() { 
        if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
          aCallback(anHttpRequest.responseText);
      }

      anHttpRequest.open( "GET", aUrl, true );            
      anHttpRequest.send( null );
    }
  }

  function initialize() { 
    directionsDisplay = new google.maps.DirectionsRenderer();


    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("directionsPanel"));
    var infowindow = new google.maps.InfoWindow();

    var marker, i,flightPlanCoordinates;
    var request = {
      travelMode: google.maps.TravelMode.DRIVING
    };
    var client = new HttpClient();
    var data =[];
    client.get('app/data/data.json', function(response) {
      locations = JSON.parse(response);
      for (i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(locations[i].delivery_latitude, locations[i].delivery_longitude),
          map: map
        });

        google.maps.event.addListener(marker, 'click', (function(marker, i) {
          return function() {
            infowindow.setContent(locations[i].delivery_address);
            infowindow.open(map, marker);
          }
        })(marker, i));
        if (i == 0) request.origin = marker.getPosition();
        else if (i == locations.length - 1) request.destination = marker.getPosition();
        else {
          if (!request.waypoints) request.waypoints = [];
          request.waypoints.push({
            location: marker.getPosition(),
            stopover: true
          });
        }


      }
      
      var activities = document.getElementById("select");
      activities.addEventListener("change",function(){
        if(activities.value == "0")
        {
         flightPlanCoordinates = [
         new google.maps.LatLng(locations[0].delivery_latitude,locations[0].delivery_longitude),
         new google.maps.LatLng(locations[1].delivery_latitude, locations[1].delivery_longitude),
         ];

       }
       else  if(activities.value == "1"){
        flightPlanCoordinates = [
        new google.maps.LatLng(locations[1].delivery_latitude, locations[1].delivery_longitude),
        new google.maps.LatLng(locations[2].delivery_latitude, locations[2].delivery_longitude),
        ];

      }
      var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      flightPath.setMap(map);
    });

    });
  directionsService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(result);
    }
  });

}

google.maps.event.addDomListener(window, "load", initialize);