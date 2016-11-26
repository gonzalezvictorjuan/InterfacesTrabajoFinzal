    var maxIdTweetCity = [];

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

    function buscarCiudadMaxId(latLng, id) {
        var resp;
        for (var i = 0; i < maxIdTweetCity.length; i++) {
            var city = maxIdTweetCity[i];
            if ((latLng.lat() === city.latLng.lat) && (latLng.lng() === city.latLng.lng)) {
                resp = maxIdTweetCity[i];
            }
        }
        return resp;
    }

    function getTweetsByLocation(latLngObj, radioKm, count) {
        var boolean = true;
        var params = {
            q: "-RT",
            geocode: latLngObj.lat() + "," + latLngObj.lng() + "," + radioKm + "km",
            count: count
        };
        var respuesta = buscarCiudadMaxId(latLngObj);
        if (typeof respuesta !== 'undefined') {
            params.since_id = respuesta.max_id;
        } else {
            var place = {};
            place.latLng = latLngObj.toJSON();
            place.max_id = 0;
            respuesta = place;
            maxIdTweetCity.push(place);
        }
        cb.__call(
            "search_tweets",
            params
        ).then(function(data) {
            console.log("Obtenidos los tweets en locacion");
            if(typeof data.reply.search_metadata !== 'undefined'){
              respuesta.max_id = data.reply.search_metadata.max_id;
            }
            var limit = data.rate.remaining;
            calcularMaxCityCount(limit);
            for (var tweet in data.reply.statuses) { //ciclo los tweets, statuses es un arreglo json de exactamente count tweets
                var tweet = data.reply.statuses[tweet];
                if (tweet.geo) {
                    crearMarcador(tweet.geo.coordinates[0], tweet.geo.coordinates[1], tweet);
                } else {
                    var radioMetros = ((radioKm * 1000) * 30) / 100;
                    var randomLoc = getRandomLocation(latLngObj.lat(), latLngObj.lng(), radioMetros);
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
