var lat;
var long;
var map;
var maxCityCount = 15;

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
        url: "http://api.geonames.org/citiesJSON?north=" + north + "&south=" + south + "&east=" + east + "&west=" + west + "&maxRows=" + maxCityCount + "&username=interfacesTP",
        dataType: "jsonp",
        success: function(data) {
            for (var city in data.geonames) {
                var city = data.geonames[city];
                //var radio = (Math.sqrt(city.population) / 10); UNA FORMA
                var radio = ((city.population) * 0.025) / 100;
                if (radio === 0) {
                    radio = 5;
                }
                var cityCenter = new google.maps.LatLng({
                    lat: city.lat,
                    lng: city.lng
                });
                getTweetsByLocation(cityCenter, radio, 10);
            }
        }
    });
}

function tweetPopup(tweet, map, marker) {
    var infowindow = new google.maps.InfoWindow;
    google.maps.event.addListener(marker, 'click', (function(marker, tweet, infowindow) {
        return function() {

            closeInfos();
            map.setCenter(marker.getPosition());

            var urlTweet = "https%3A%2F%2Ftwitter.com%2FInterior%2Fstatus%2F" + tweet.id_str;
            $.ajax({
                url: "https://publish.twitter.com/oembed?url=" + urlTweet + "&hide_media=true&hide_thread=true&omit_script=true",
                dataType: "jsonp",
                success: function(data) {
                    infowindow.setContent(data.html);
                    infowindow.open(map, marker);
                    var iwindow = document.getElementsByClassName("gm-style-iw");
                    twttr.widgets.load(iwindow);
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
