var CityList = [];

var infos = [];
var woeIDS = [];
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


function buscarCiudadMaxId(latLng, id) {
    var resp;
    for (var i = 0; i < CityList.length; i++) {
        var city = CityList[i];
        if ((latLng.lat() === city.latLng.lat) && (latLng.lng() === city.latLng.lng)) {
            resp = CityList[i];
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
        place.tweetMarker = [];
        place.tweetCountMarker = null;
        respuesta = place;
        CityList.push(place);
        crearMarkerTweetCount(respuesta);
    }
    cb.__call(
        "search_tweets",
        params
    ).then(function(data) {
        if (data.reply.hasOwnProperty('errors')) {
            console.log("Limite Execido de request a search/tweets")
            mostrarError("Error, intente de nuevo más tarde");
        } else {
            console.log("Obtenidos los tweets en locacion");
            for (var tweet in data.reply.statuses) { //ciclo los tweets, statuses es un arreglo json de exactamente count tweets
                var tweet = data.reply.statuses[tweet];
                if (tweet.geo) {
                    crearMarcador(tweet.geo.coordinates[0], tweet.geo.coordinates[1], tweet, respuesta);
                } else {
                    var radioMetros = ((radioKm * 1000) * 30) / 100;
                    var randomLoc = getRandomLocation(latLngObj.lat(), latLngObj.lng(), radioMetros);
                    crearMarcador(randomLoc.latitude, randomLoc.longitude, tweet, respuesta);
                    //getTweetData(data.reply.statuses[tweet]);
                }
            }
        }
        ocultarSpinnerTweet();
        if (typeof data.reply.search_metadata !== 'undefined') {
            respuesta.max_id = data.reply.search_metadata.max_id;
            actualizarContador(respuesta);
        }
        var limit = data.rate.remaining;
        calcularMaxCityCount(limit);
    }, function(err) {
        console.log("Error al obtener los tweets en locacion");
    });

}

function getTrendsHash(woeid, latLngObj, radio) {
    var params = {
        id: woeid
    };
    cb.__call(
        "trends_place",
        params
    ).then(function(data) {
        console.log("Obtenidos los trends");
        if (data.reply.hasOwnProperty('errors')) {
            console.log("Limite Execido de request a trends/place");
            mostrarError("Error, intente de nuevo más tarde");
        } else {
            var trendsOrdenadosPorVolumen = sortByVolumenVieja(data.reply[0]);
            for (var i = 0; i < 5; i++) {
                // var trendName = data.reply[0].trends[i].name;
                // var trendVolume = data.reply[0].trends[i].tweet_volume;
                //console.log(trendName + " - " + trendVolume);
                var trendName = trendsOrdenadosPorVolumen[i].name;
                var trendVolume = trendsOrdenadosPorVolumen[i].tweet_volume;
                crearMarcadorTrend(trendName, trendVolume, latLngObj, radio);
            }
        }
        ocultarSpinnerTrends();
    }, function(err) {
        console.log("Error al obtener los trends");
    });
}

function sortByVolumenVieja(trendsJson) {
    var values = $.map(trendsJson, function(el) {
        return el;
    });
    return values.sort(function(a, b) {
        return b.tweet_volume - a.tweet_volume
    });
}
var cont = 1;
function getWOEIDByLat(latLngObj, radio) {
    cont++;
    
    var params = {
        lat: latLngObj.lat(),
        long: latLngObj.lng()
    };
    cb.__call(
        "trends_closest",
        params
    ).then(function(data) {
        //console.log("Obtenidos el woeid en " + latLngObj.lat() + " - " + latLngObj.lng());
        console.log(data.reply);
        var todosRepetidos = true;
        if (data.reply.hasOwnProperty('errors')) {
            console.log("Limite Execido de request a trends/closest");
            mostrarError("Error, intente de nuevo más tarde");
        } else {
            for (var i = 0; i < Object.keys(data.reply).length - 1; i++) {
                var woeid = data.reply[i].woeid;
                //console.log("WOEID"+woeid);
                //console.log("woeid repetido: "+woeid+" => "+$.inArray(woeid, woeIDS));
                if ($.inArray(woeid, woeIDS) == -1) {
                    woeIDS.push(woeid);
                    getTrendsHash(woeid, latLngObj, radio);
                    todosRepetidos = false;
                } else {
                    console.log("Repetido " + woeid);
                }
            }
            console.log("verif:"+cont+" "+cantCiudades+" "+todosRepetidos);
            if((cont == cantCiudades) && todosRepetidos){
                ocultarSpinnerTrends();
            }
        }
    }, function(err) {
        console.log("Error al obtener los trends");
    });
}
