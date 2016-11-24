$(document).ready(function() {

    var infos = [];
    //aca empieza lo de twitter api
    var max_tweet_id = 0;
    var cb = new Codebird;
    cb.setConsumerKey("JvECVVUXHhuH7ISNotmFHKy2v", "FmxyFj3dh8zTUvPXDYAjXaKRGqipqYWnLexKBV6nRYpnPR9qg2");
    //logea como app
    login();

    function login() {
        cb.__call(
            "oauth2_token", {},
            function(reply, err) {
                var bearer_token;
                if (err) {
                    console.log("Error: " + err.error);
                }
                if (reply) {
                    bearer_token = reply.access_token;
                }
            }
        ).then(function(data) {
            //doStuff();
        });
    }

    //esta funcion esta asi de fea para debugear que habia en los tweets, basicamente extrae la info del json de cada tweet, llamada desde getTweetsByLocation
    function getTweetData(tweetJson) {
        var id = tweetJson.id;
        var hashtagsArr = $.map(tweetJson.entities.hashtags, function(el) {
            return el;
        }); //esto mapea un arreglo json a un arreglo javascript
        var geo = tweetJson.geo;
        var coordinates = tweetJson.coordinates;
        var place = tweetJson.place;

        console.log("Tweet ID " + id);
        for (var i = 0; i < hashtagsArr.length; i++) { //listo los hashtags
            console.log("Tweet hash " + hashtagsArr[i].text);
        }
        console.log("Tweet geo " + geo); //esto todavia no se que tiene, pero casi ningun tweet tiene esto
        console.log("Tweet coords " + coordinates);
        if (coordinates) {
            var latlng = JSON.stringify(coordinates.coordinates).slice(1, -1); //le saco el primer y ultimo caracter que son [ y ]
            var latlngArr = latlng.split(','); //parto la coma
            crearMarcador(latlngArr[0], latlngArr[1], hashtagsArr)
        }
        if (place) {
            //console.log(JSON.stringify(place));
            var city = place.name;
            var placeID = place.id;
            var country = place.country;
            var boundingBoxJson = place.bounding_box.coordinates[0];
            console.log("Ciudad " + city);
            console.log("PlaceID " + placeID);
            console.log("pais " + country);
            console.log("bounding_box " + JSON.stringify(boundingBoxJson));
        }

    }

    function getTweetsByLocation(latLngObj, radioKm, count) {
        var boolean = true;
        var params = {
            geocode: latLngObj.lat() + "," + latLngObj.lng() + "," + radioKm + "km",
            count: count
        };
        if (max_tweet_id !== 0) {
            params.max_id = max_tweet_id;
        }
        cb.__call(
            "search_tweets",
            params
        ).then(function(data) {
            console.log("Obtenidos los tweets en locacion");
            max_tweet_id = data.reply.statuses[data.reply.statuses.length - 1].id;
            console.log(max_tweet_id);
            for (var tweet in data.reply.statuses) { //ciclo los tweets, statuses es un arreglo json de exactamente count tweets
                var tweet = data.reply.statuses[tweet];
                if (tweet.geo) {
                    crearMarcador(tweet.geo.coordinates[0], tweet.geo.coordinates[1], tweet);
                } else {
                    var randomLoc = getRandomLocation(latLngObj.lat(), latLngObj.lng(), radioKm + 20000);
                    crearMarcador(randomLoc.latitude, randomLoc.longitude, tweet);
                    //getTweetData(data.reply.statuses[tweet]);
                }
            }
        }, function(err) {
            console.log("error al botener los tweets en locacion");
        });

    }

    function getTrendsHash(woeid) {
        var params = {
            id: woeid
        };
        cb.__call(
            "trends_place",
            params
        ).then(function(data) {
            console.log("Obtenidos los trends");
            for (var i = 0; i < 50; i++) {
                var trendName = data.reply[0].trends[i].name;
                var trendVolume = data.reply[0].trends[i].tweet_volume;
                console.log(trendName + " - " + trendVolume);
            }
        }, function(err) {
            console.log("error al obtener los trends");
        });
    }

    function getWOEIDByLat(latLngObj) {
        var params = {
            lat: latLngObj.lat(),
            long: latLngObj.lng()
        };
        cb.__call(
            "trends_closest",
            params
        ).then(function(data) {
            console.log("Obtenidos el woeid en " + latLngObj.lat() + " - " + latLngObj.lng());
            for (var i = 0; i < Object.keys(data.reply).length - 1; i++) {
                var woeid = data.reply[i].woeid;
                getTrendsHash(woeid);
            }
        }, function(err) {
            console.log("error al obtener los trends");
        });
    }

    //aca empieza lo de gmaps api
    var estilo = [{
        "elementType": "geometry",
        "stylers": [{
            "color": "#1d2c4d"
        }]
    }, {
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#8ec3b9"
        }]
    }, {
        "elementType": "labels.text.stroke",
        "stylers": [{
            "color": "#1a3646"
        }]
    }, {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [{
            "color": "#4b6878"
        }]
    }, {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#64779e"
        }]
    }, {
        "featureType": "administrative.province",
        "elementType": "geometry.stroke",
        "stylers": [{
            "color": "#4b6878"
        }]
    }, {
        "featureType": "landscape.man_made",
        "elementType": "geometry.stroke",
        "stylers": [{
            "color": "#334e87"
        }]
    }, {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [{
            "color": "#023e58"
        }]
    }, {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{
            "color": "#283d6a"
        }]
    }, {
        "featureType": "poi",
        "elementType": "labels.text",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#6f9ba5"
        }]
    }, {
        "featureType": "poi",
        "elementType": "labels.text.stroke",
        "stylers": [{
            "color": "#1d2c4d"
        }]
    }, {
        "featureType": "poi.business",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#023e58"
        }]
    }, {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#3C7680"
        }]
    }, {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{
            "color": "#304a7d"
        }]
    }, {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#98a5be"
        }]
    }, {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [{
            "color": "#1d2c4d"
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{
            "color": "#2c6675"
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{
            "color": "#255763"
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#b0d5ce"
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "labels.text.stroke",
        "stylers": [{
            "color": "#023e58"
        }]
    }, {
        "featureType": "transit",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#98a5be"
        }]
    }, {
        "featureType": "transit",
        "elementType": "labels.text.stroke",
        "stylers": [{
            "color": "#1d2c4d"
        }]
    }, {
        "featureType": "transit.line",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#283d6a"
        }]
    }, {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [{
            "color": "#3a4762"
        }]
    }, {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{
            "color": "#0e1626"
        }]
    }, {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#4e6d70"
        }]
    }];

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

    function addYourLocationButton(map) {
        var controlDiv = document.createElement('div');

        var firstChild = document.createElement('button');
        firstChild.style.backgroundColor = '#fff';
        firstChild.style.border = 'none';
        firstChild.style.outline = 'none';
        firstChild.style.width = '28px';
        firstChild.style.height = '28px';
        firstChild.style.borderRadius = '2px';
        firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
        firstChild.style.cursor = 'pointer';
        firstChild.style.marginRight = '10px';
        firstChild.style.padding = '0';
        firstChild.title = 'Your Location';
        controlDiv.appendChild(firstChild);

        var secondChild = document.createElement('div');
        secondChild.style.margin = '5px';
        secondChild.style.width = '18px';
        secondChild.style.height = '18px';
        secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png)';
        secondChild.style.backgroundSize = '180px 18px';
        secondChild.style.backgroundPosition = '0 0';
        secondChild.style.backgroundRepeat = 'no-repeat';
        firstChild.appendChild(secondChild);

        google.maps.event.addListener(map, 'center_changed', function() {
            secondChild.style['background-position'] = '0 0';
        });

        firstChild.addEventListener('click', function() {
            var imgX = 0,
                animationInterval = setInterval(function() {
                    imgX = -imgX - 18;
                    secondChild.style['background-position'] = imgX + 'px 0';
                }, 500);

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    map.setCenter(latlng);
                    map.setZoom(10);
                    clearInterval(animationInterval);
                    secondChild.style['background-position'] = '-144px 0';
                });
            } else {
                clearInterval(animationInterval);
                secondChild.style['background-position'] = '0 0';
            }
        });

        controlDiv.index = 1;
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
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

});
