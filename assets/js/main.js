  var geocoder;
  var map;
  var zoom = 15;

  if ( window.screen.width < 600 ) {
    zoom = 14;
  }

  function init() {
  	const windowHeight = window.screen.height;
  	const searchElem = document.querySelector(".search");
  	const searchHeight = searchElem.getBoundingClientRect().height;
  	const mapHeight = windowHeight - searchHeight - 100;
  	
  	document.getElementById('map').style.height = mapHeight + 'px';
    
  	geocoder = new google.maps.Geocoder();
  	var latlng = new google.maps.LatLng(32.0718351, 34.808751);
  	var mapOptions = {
  	  zoom: 10,
  	  center: latlng,
      mapTypeControl: false,
      streetViewControl: false
  	}
  	map = new google.maps.Map(document.getElementById('map'), mapOptions);
  	
  	initFullscreenControl(map);
  }
  
  function clearValOnInit() {
    document.querySelector('input[type="text"]').removeAttribute('value');
  }

  function checkAddress() {
  	init();
  	
  	var address = document.getElementById('address').value;
  	
  	geocoder.geocode( { 'address': address}, function(results, status) {
  	  if (status == 'OK') {
    		map.setCenter(results[0].geometry.location);

        if ( address == 'Derech Menachem Begin 125, Tel Aviv' ) {
          var contentString = '<div id="content"><div id="bodyContent"><p><h3>This is an Example Address (' + address + ').</h3>Please enter your address for check in the form above or use GPS Auto-detect button.</p></div></div>';
        } else {
          var contentString = '<div id="content">'+
            '<div id="bodyContent">'+
              '<p><h2><u>Radius 1km for:</u> <b>' + address + '</b></h2></p>'+
              '<p>Please don`t ignore restrictions of the Ministry of Health: <a href="https://govextra.gov.il/ministry-of-health/corona/corona-virus/" target="_blank">'+ 'Full list of restrictions</a> ' + 
            '</div>' +
          '</div>';
        }

        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });

    		var marker = new google.maps.Marker({
    			map: map,
          title: address,
    			position: results[0].geometry.location
    		});

        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
    		
        infowindow.open(map, marker);
    		map.setZoom(zoom);

        const cityCircle = new google.maps.Circle({
    		  strokeColor: "#FF0000",
    		  strokeOpacity: 0.8,
    		  strokeWeight: 2,
    		  fillColor: "#FF0000",
    		  fillOpacity: 0.15,
    		  map,
    		  center: results[0].geometry.location,
    		  radius: 1000
    		});  		
  	  } else {
  		  alert('Geocode was not successful for the following reason: ' + status);
  	  }
  	});
  }
  
  function initFullscreenControl(map) {
    const elementToSendFullscreen = map.getDiv().firstChild;
    const fullscreenControl = document.querySelector(".fullscreen-control");
    
    fullscreenControl.onclick = function() {
      if (isFullscreen(elementToSendFullscreen)) {
		    fullscreenControl.querySelector("button").innerHTML = "Open Map in Full Screen Mode";
	  
        exitFullscreen();
      } else {
    		fullscreenControl.querySelector("button").innerHTML = "Disable Fullscreen";
    	  
    		map.controls[google.maps.ControlPosition.TOP_CENTER].push(
    		  fullscreenControl
    		);
	  
        requestFullscreen(elementToSendFullscreen);
      }
    };

    document.onwebkitfullscreenchange = document.onmsfullscreenchange = document.onmozfullscreenchange = document.onfullscreenchange = function() {
      if (isFullscreen(elementToSendFullscreen)) {
        fullscreenControl.classList.add("is-fullscreen");
      } else {
        fullscreenControl.classList.remove("is-fullscreen");
      }
    };
  }

  function isFullscreen(element) {
    return (
      (document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement) == element
    );
  }

  function requestFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullScreen) {
      element.msRequestFullScreen();
    }
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
  
  
  let placeSearch;
  let autocomplete;
  const componentForm = {
    street_number: "short_name",
    route: "long_name",
    locality: "long_name",
    administrative_area_level_1: "short_name",
    country: "long_name",
    postal_code: "short_name"
  };

  function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
      document.getElementById("address"),
      {
        types: ["geocode"]
      }
    );

    autocomplete.setFields(["address_component"]);
    autocomplete.addListener("place_changed", fillInAddress);
  }

  function fillInAddress() {
    const place = autocomplete.getPlace();

    for (const component in componentForm) {
      document.getElementById(component).value = "";
      document.getElementById(component).disabled = false;
    }

    for (const component of place.address_components) {
      const addressType = component.types[0];

      if (componentForm[addressType]) {
        const val = component[componentForm[addressType]];
        document.getElementById(addressType).value = val;
      }
    }
  }

  function geolocate() {
    init();
    clearValOnInit();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const geolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        map.setCenter(geolocation);
        map.setZoom(zoom);

        geocoder.geocode({'location': geolocation}, function(results, status) {
          if (status === 'OK') {
            if (results[0]) {
              var formattedAddress = results[0].formatted_address;
            } else {
              var formattedAddress = geolocation.lat + ', ' + geolocation.lng;
            }

            var contentString = '<div id="content">'+
              '<div id="bodyContent">'+
                '<p><h2><u>Radius 1km for:</u> <b>' + formattedAddress + '</b></h2></p>'+
                '<p>Please don`t ignore restrictions of the Ministry of Health: <a href="https://govextra.gov.il/ministry-of-health/corona/corona-virus/" target="_blank">'+ 'Full list of restrictions</a> ' + 
              '</div>' +
            '</div>';

            var infowindow = new google.maps.InfoWindow({
              content: contentString
            });

            var marker = new google.maps.Marker({
              map: map,
              position: geolocation
            });

            marker.addListener('click', function() {
              infowindow.open(map, marker);
            });
            
            infowindow.open(map, marker);
            
            const cityCircle = new google.maps.Circle({
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#FF0000",
              fillOpacity: 0.15,
              map,
              center: geolocation,
              radius: 1000
            });
          } else {
            window.alert('Geocoder failed due to: ' + status);
          }
        });
      });
    }
  }