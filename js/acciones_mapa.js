var lat;
var long;
var map;
var maxCityCount = 15;

var tweetMarkers = [];
var trendMarkers = [];

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
    map.addListener('zoom_changed', actualizarDatos);
    //map.addListener('bounds_changed', accionCambioBound);
    map.addListener('dragend', actualizarDatos);
    //map.addListener('center_changed',accionCambioCentro);
    addYourLocationButton(map);
}


function actualizarDatos() {
    var zoom = map.getZoom();
    console.log(zoom);
    if (zoom < 8) {
        ocultarTweetCount();
        console.log("trends");
        mostrarTrends();
        ocultarTweets();
        buscarTrends();
    } else {
        ocultarTrends();
        buscarTweets();
        if (zoom >= 8 && zoom <= 10) {
            ocultarTweets();
        } else {
            ocultarTweetCount();
            mostrarTweets();
        }
    }
}

function buscarTrends() {
    console.log("buscando trends")
    var center = map.getCenter();
    var north = map.getBounds().getNorthEast().lat();
    var east = map.getBounds().getNorthEast().lng();
    var south = map.getBounds().getSouthWest().lat();
    var west = map.getBounds().getSouthWest().lng();
    $.ajax({
        url: "http://api.geonames.org/citiesJSON?north=" + north + "&south=" + south + "&east=" + east + "&west=" + west + "&maxRows=" + 5 + "&username=interfacesTP",
        dataType: "jsonp",
        success: function(data) {
            console.log(data);
            for (var city in data.geonames) {
                var city = data.geonames[city];
                var radio = ((city.population) * 0.025) / 100;
                if (radio === 0) {
                    radio = 5;
                }
                var cityCenter = new google.maps.LatLng({
                    lat: city.lat,
                    lng: city.lng
                });
                getWOEIDByLat(cityCenter, 30000);
            }
        }
    });
}

function ocultarTweets() {
    tweetMarkers.forEach(function(marker) {
        marker.setVisible(false);
    }, this);
}

function mostrarTweets() {
    tweetMarkers.forEach(function(marker) {
        marker.setVisible(true);
    }, this);
}

function ocultarTweetCount() {
    for (var i = 0; i < CityList.length; i++) {
        var city = CityList[i];
        var marker = city.tweetCountMarker;
        marker.setVisible(false);
    }
}

function ocultarTrends() {
    trendMarkers.forEach(function(marker) {
        marker.setVisible(false);
    }, this);
}

function mostrarTrends() {
    trendMarkers.forEach(function(marker) {
        marker.setVisible(true);
    }, this);
}

function buscarTweets() {
    var center = map.getCenter();
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

function crearMarcadorTrend(trendName, trendVolume, latLngObj, radio) {
    var cssClass = "plagioTrendsMapChico";
    if (trendVolume > 15000)
        cssClass = "plagioTrendsMapMediano"
    if (trendVolume > 50000)
        cssClass = "plagioTrendsMapGrande"

    var randloc = getRandomLocation(latLngObj.lat(), latLngObj.lng(), radio * 10);
    var marker = new MarkerWithLabel({
        position: new google.maps.LatLng(randloc.latitude, randloc.longitude),
        draggable: false,
        raiseOnDrag: false,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE, //el path es obligatorio, pero da igual lo que pongamos porque no se va a ver.
            scale: 0 //tamaño del marker real, le pongo 0 y así no se ve.
        },
        labelContent: trendName, // + " - " + trendVolume + cssClass,
        labelAnchor: new google.maps.Point(22, 0),
        labelClass: cssClass //"labels" // the CSS class for the label
    });
    trendMarkers.push(marker);
    marker.setMap(map);
}

function crearMarcador(lat, lng, tweet, city) {
    //console.log("Se crea un marcador");
    // var cords = {lat: lat, lng: lng}
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        //animation: google.maps.Animation.BOUNCE,
        icon: 'twitter-logo.png'
            // title: hashtags[0]
    });
    city.tweetMarker.push(marker);
    console.log(city);
    marker.setMap(map);
    tweetMarkers.push(marker);
    tweetPopup(tweet, map, marker);
    if ((map.getZoom() < 8)||((map.getZoom() >= 8) && (map.getZoom() <= 10)))
        marker.setVisible(false);
}

function closeInfos() {
    if (infos.length > 0) {
        infos[0].set("marker", null);
        infos[0].close();
        infos.length = 0;
    }
}

function crearMarkerTweetCount(city) {
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(city.latLng.lat, city.latLng.lng),
        icon: 'twitter-logo.png'
    });
    city.tweetCountMarker = marker;
    city.tweetCountMarker.setMap(map);
    city.tweetCountMarker.setVisible(false);
}

function actualizarContador(city) {
    if (map.getZoom() < 8 || map.getZoom() > 10) {
        city.tweetCountMarker.setVisible(false);
    } else {
        var count = city.tweetMarker.length;
        if (count > 0) {
            city.tweetCountMarker.setLabel(count.toString());
            city.tweetCountMarker.setVisible(true);
        } else {
            city.tweetCountMarker.setVisible(false);
        }
    }
}

google.maps.event.addDomListener(window, 'load', getLocation);
