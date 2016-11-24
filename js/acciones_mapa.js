var lat;
var long;
var map;
//supuestamente el radio dice que es en metros, pero si le tiro 100 metros me los tira adentro de una manzana...
function getRandomLocation(latitude, longitude, radiusInMeters) {
    var getRandomCoordinates = function(radius, uniform) {
        // Generate two random numbers
        var a = Math.random(),
            b = Math.random();

        // Flip for more uniformity.
        if (uniform) {
            if (b < a) {
                var c = b;
                b = a;
                a = c;
            }
        }

        // It's all triangles.
        return [
            b * radius * Math.cos(2 * Math.PI * a / b),
            b * radius * Math.sin(2 * Math.PI * a / b)
        ];
    };

    var randomCoordinates = getRandomCoordinates(radiusInMeters, true);

    // Earths radius in meters via WGS 84 model.
    var earth = 6378137;

    // Offsets in meters.
    var northOffset = randomCoordinates[0],
        eastOffset = randomCoordinates[1];

    // Offset coordinates in radians.
    var offsetLatitude = northOffset / earth,
        offsetLongitude = eastOffset / (earth * Math.cos(Math.PI * (latitude / 180)));

    // Offset position in decimal degrees.
    return {
        latitude: latitude + (offsetLatitude * (180 / Math.PI)),
        longitude: longitude + (offsetLongitude * (180 / Math.PI))
    }
};


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    lat = position.coords.latitude;
    long = position.coords.longitude;
    initialize();
}


function initialize() {
    var latlng = new google.maps.LatLng(lat, long);

    var mapOptions = {
        zoom: 9,
        maxZoom: 16,
        minZoom: 2,
        styles: estilo,
        mapTypeControl: false,
        streetViewControl: false,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    map = new google.maps.Map(document.getElementById("zona_mapa"), mapOptions);

    /************Prueba MARCADORES***************/
    /*Prueba marcador circulo*/
    /*var myCity = new google.maps.Circle({
    	center: latlng,
    	radius: 120000,
    	strokeColor: "#0000FF",
    	strokeOpacity: 0.8,
    	strokeWeight: 2,
    	fillColor: "#0000FF",
    	fillOpacity: 0.4
    });
    myCity.setMap(map);*/
    /*Marcador twitter prueba*/

    /* Marcador animado
  				var marker = new google.maps.Marker({
    				position:latlng,
    				animation:google.maps.Animation.BOUNCE
    			});
  				marker.setMap(map);*/
    /* Marcador común
    var marker = new google.maps.Marker({position: latlng});
    marker.setMap(map);*/

    /***************Prueba Eventos**************/
    map.addListener('zoom_changed', accionCambioZoom);
    //map.addListener('bounds_changed', accionCambioBound);
    map.addListener('dragend', accionCambioBound);
    //map.addListener('center_changed',accionCambioCentro);
    addYourLocationButton(map);
}

function accionCambioZoom() {
    var zoom = map.getZoom();
    console.log(zoom);
    if (zoom > 14) {
        console.log("*******Ocultar todo*******");
    }
    if (zoom <= 14 && zoom >= 9) {
        console.log("*******Mostrar hashtags y ocultar trends*******");
    }
    if (zoom < 9 && zoom >= 2) {
        console.log("*******Mostrar trends y ocultar hashtags*******");
    }

}

function accionCambioBound() {

    var center = map.getCenter();
    console.log(center);
    console.log(map.getBounds());
    //al mover el mapa busco tweets
    //getTrendsHash(1);
    getWOEIDByLat(center);
    searchCity(map);
}

function searchCity(map) {
    var north = map.getBounds().getNorthEast().lat();
    var east = map.getBounds().getNorthEast().lng();
    var south = map.getBounds().getSouthWest().lat();
    var west = map.getBounds().getSouthWest().lng();
    $.ajax({
        url: "http://api.geonames.org/citiesJSON?north=" + north + "&south=" + south + "&east=" + east + "&west=" + west + "&username=interfacesTP",
        dataType: "jsonp",
        success: function(data) {
            for (var city in data.geonames) {
                var city = data.geonames[city];
                var cityCenter = new google.maps.LatLng({
                    lat: city.lat,
                    lng: city.lng
                });
                getTweetsByLocation(cityCenter, 20, 20);
            }
        }
    });
}

function tweetPopup(tweet, map, marker) {
    var infowindow = new google.maps.InfoWindow;
    google.maps.event.addListener(marker, 'click', (function(marker, tweet, infowindow) {
        return function() {

            closeInfos();

            var urlTweet = "https%3A%2F%2Ftwitter.com%2FInterior%2Fstatus%2F" + tweet.id_str;

            $.ajax({
                url: "https://publish.twitter.com/oembed?url=" + urlTweet,
                dataType: "jsonp",
                success: function(data) {
                    infowindow.setContent(data.html);
                    infowindow.open(map, marker);
                    twttr.widgets.load();
                    infos[0] = infowindow;
                }
            });

        };
    })(marker, tweet, infowindow));
}

function crearMarcador(lat, lng, tweet) {
    console.log("Se crea un marcador");
    // var cords = {lat: lat, lng: lng}
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        //animation: google.maps.Animation.BOUNCE,
        icon: 'twitter-logo.png'
            // title: hashtags[0]
    });

    tweetPopup(tweet, map, marker);

    marker.setMap(map);
}

function closeInfos() {
    if (infos.length > 0) {
        infos[0].set("marker", null);
        infos[0].close();
        infos.length = 0;
    }
}

function accionCambioCentro() {
    var center = map.getCenter().toString();
    console.log(center);
}

google.maps.event.addDomListener(window, 'load', getLocation);
