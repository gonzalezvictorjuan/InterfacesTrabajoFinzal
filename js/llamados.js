$(document).ready(function () {
    
    //aca empieza lo de twitter api
    var max_tweet_id = 0;
    var cb = new Codebird;
    cb.setConsumerKey("JvECVVUXHhuH7ISNotmFHKy2v", "FmxyFj3dh8zTUvPXDYAjXaKRGqipqYWnLexKBV6nRYpnPR9qg2");
    //logea como app
    login();
    
    function login() {
        cb.__call(
            "oauth2_token",
            {},
            function (reply, err) {
                var bearer_token;
                if (err) {
                    console.log("Error: " + err.error);
                }
                if (reply) {
                    bearer_token = reply.access_token;
                }
            }
        ).then(function (data) {
            //doStuff();
        });
    }

    //esta funcion esta asi de fea para debugear que habia en los tweets, basicamente extrae la info del json de cada tweet, llamada desde getTweetsByLocation
    function getTweetData(tweetJson) {
        var id = tweetJson.id;
        var hashtagsArr = $.map(tweetJson.entities.hashtags, function (el) { return el; });//esto mapea un arreglo json a un arreglo javascript(al pedo porque no me sirvio de nada)
        var geo = tweetJson.geo;
        var coordinates = tweetJson.coordinates;
        var place = tweetJson.place;

        console.log("Tweet ID " + id);
        for (var i = 0; i < hashtagsArr.length; i++) {//listo los hashtags
            console.log("Tweet hash " + hashtagsArr[i].text);
        }
        console.log("Tweet geo " + geo);//esto todavia no se que tiene, pero casi ningun tweet tiene esto
        console.log("Tweet coords " + coordinates);
        if (coordinates) {
            var latlng = JSON.stringify(coordinates.coordinates).slice(1, -1);//le saco el primer y ultimo caracter que son [ y ]
            var latlngArr = latlng.split(',');//parto la coma
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
        if(max_tweet_id !== 0){
          params.max_id = max_tweet_id;
        }
        cb.__call(
            "search_tweets",
            params
        ).then(function (data) {
            console.log("Obtenidos los tweets en locacion");
            max_tweet_id = data.reply.statuses[data.reply.statuses.length-1].id;
            console.log(max_tweet_id);
            for (var tweet in data.reply.statuses) {//ciclo los tweets, statuses es un arreglo json de exactamente count tweets
                var tweet = data.reply.statuses[tweet];
                if(tweet.geo){
                  crearMarcador(tweet.geo.coordinates[0], tweet.geo.coordinates[1]);
                }
                else{
                  var randomLoc = getRandomLocation(latLngObj.lat(), latLngObj.lng(), radioKm + 20000);//le sume mil para que no los tire tan cerca pero no sirvio de mucho..
                  //alert(randomLoc.latitude+" "+randomLoc.longitude);
                  crearMarcador(randomLoc.latitude, randomLoc.longitude);
                  //getTweetData(data.reply.statuses[tweet]);
                }
            }
        }, function (err) {
            console.log("error al botener los tweets en locacion");
        });


        // https://api.twitter.com/1.1/geo/search.json?accuracy=500000000m&granularity=city&lat=-37.3287999&long=-59.136716699999965 MIRAR!!!!!!!

        // "max_id": 799403049684865000,"next_results": "?max_id=799402009623404544&q=&geocode=-37.3287999%2C-59.136716699999965%2C50km&count=2&include_entities=1" Para ver los proximos tweets
        /*{"text":"hace 800 años no escuchaba memphis boludo","entities":{"hashtags":[]},"user":{"location":"Zona sur ","description":"17. ♑   // haceme sonreir, cortame de oreja a oreja //"},"geo":null,"coordinates":null,"place":{"id":"4afa2757051c5192","name":"Buenos Aires","full_name":"Buenos Aires, Argentina","country_code":"AR","country":"Argentina","bounding_box":{"type":"Polygon","coordinates":[[[-63.39386,-41.035009],[-56.665836,-41.035009],[-56.665836,-33.260144],[-63.39386,-33.260144]]]},}*/

    }

    function getTrendsHash(woeid) {
        var params = {
            id:woeid
        };
        cb.__call(
            "trends_place",
            params
        ).then(function (data) {
            console.log("Obtenidos los trends");
            for (var i = 0; i < 50; i++) {
                var trendName = data.reply[0].trends[i].name;
                var trendVolume = data.reply[0].trends[i].tweet_volume;
                console.log(trendName+" - "+trendVolume);
            }
        }, function (err) {
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
        ).then(function (data) {
            console.log("Obtenidos el woeid en "+latLngObj.lat()+" - "+latLngObj.lng());
             for (var i = 0; i < Object.keys(data.reply).length-1; i++) {//le resto uno porque el ultimo elemento de reply son boludeces de codebird
                 var woeid = data.reply[i].woeid;
                 getTrendsHash(woeid);
             }
        }, function (err) {
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
        var getRandomCoordinates = function (radius, uniform) {
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

        /*************Prueba Posible frame para hashtag?*************/
        var iwindow = new google.maps.InfoWindow;
        map.addListener('click', function (event) {
            iwindow.setContent("Hashtag?");
            iwindow.setPosition({
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            });
            iwindow.open(map);
        });

        /***************Prueba Eventos**************/
        map.addListener('zoom_changed', accionCambioZoom);
        //map.addListener('bounds_changed', accionCambioBound);
        map.addListener('dragend', accionCambioBound);//cambiado bounds_changed por este.
        //google.maps.event.addListener(map, 'dragend', function() { alert('map dragged'); } );
        //map.addListener('center_changed',accionCambioCentro);
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
        console.log(center.lat());
        console.log(center.lng());
        console.log(map.getBounds().toString());
        //al mover el mapa busco tweets
        getTweetsByLocation(center, 20, 20);
        //getTrendsHash(1);
        getWOEIDByLat(center);
        /*var marker = new google.maps.Marker({
            position: center,
            animation: google.maps.Animation.BOUNCE,
            icon: 'twitter-logo.png'
        });
        marker.setMap(map);
        */

        //var bound = map.getBounds().toString(); // retorna objeto LatLngBounds
        // https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
        //console.log(center);
    }

    function crearMarcador(lat, lng, hashtags) {
        //alert("marker " + lat + " " + lng);
        console.log("marker creado");
        // var cords = {lat: lat, lng: lng}
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            //animation: google.maps.Animation.BOUNCE,
            icon: 'twitter-logo.png'
            // title: hashtags[0]
        });
        marker.setMap(map);
        //console.log("salio de crear marker");
    }
    function accionCambioCentro() {
        var center = map.getCenter().toString(); // retorna objeto LatLng
        // https://developers.google.com/maps/documentation/javascript/reference#LatLng
        console.log(center);
    }

    google.maps.event.addDomListener(window, 'load', getLocation);

});
