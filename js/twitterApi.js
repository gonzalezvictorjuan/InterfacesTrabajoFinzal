var cb = new Codebird;
cb.setConsumerKey("JvECVVUXHhuH7ISNotmFHKy2v", "FmxyFj3dh8zTUvPXDYAjXaKRGqipqYWnLexKBV6nRYpnPR9qg2");


login();


function getTweetData(tweetJson) {
    var id = tweetJson.id;
    var hashtagsArr = $.map(tweetJson.entities.hashtags, function (el) { return el; });//JSON.parse(JSON.stringify(tweetJson.entities.hashtags));
    var geo = tweetJson.geo;
    var coordinates = tweetJson.coordinates;
    var place = tweetJson.place;
    if (coordinates) {
        var latlng = JSON.stringify(coordinates.coordinates).slice(1, -1);
        var latlngArr = latlng.split(',');
        //alert(latlngArr[0]);
        crearMarcador(latlngArr[0], latlngArr[1], hashtagsArr)
    }
    console.log("Tweet ID " + id);
    for (var i = 0; i < hashtagsArr.length; i++) {
        console.log("Tweet hash " + hashtagsArr[i].text);
    }
    console.log("Tweet geo " + geo);
    console.log("Tweet coords " + coordinates);
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
    var params = {
        geocode: latLngObj.lat() + "," + latLngObj.lng() + "," + radioKm + "km",
        count: count
    };
    cb.__call(
        "search_tweets",
        params
    ).then(function (data) {
        console.log("Obtenidos los tweets en locacion");
        for (var tweet in data.reply.statuses) {
            //console.log(JSON.stringify(data.reply.statuses[tweet]));
            getTweetData(data.reply.statuses[tweet]);
        }
    }, function (err) {
        console.log("error al botener los tweets en locacion");
    });

}


function getUserLocationHTML5() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("error");
    }
    function showPosition(position) {
        result = { lat: position.coords.latitude, lng: position.coords.longitude };
        getTweetsByLocation(result, 1, 10);
    }
}

function getUserLocationIP() {
    /*
    "ip": "8.8.8.8",
  "hostname": "google-public-dns-a.google.com",
  "loc": "37.385999999999996,-122.0838",
  "org": "AS15169 Google Inc.",
  "city": "Mountain View",
  "region": "CA",
  "country": "US",
  "phone": 650
    */
    var latlngArr;
    var result;
    $.get("http://ipinfo.io", function (response) {
        console.log(response.loc);
        latlngArr = response.loc.split(',');
        console.log("Obtenida la locacion del usuario por IP");
    }, "jsonp").done(function (e) {
        result = { lat: latlngArr[0], lng: latlngArr[1] };
        getTweetsByLocation(result, 20, 100);
    });

}
function doStuff() {
    var lat = 36.169941;
    var lng = -115.139830;
    ids = getWOEID(lat, lng);
}//alert(ids);
//getTrends(idLugar);


function getWOEID(lat, lng) {
    var ids;
    var params = {
        lat: lat,
        long: lng
    };
    cb.__call(
        "trends_closest",
        params
    ).then(function (data) {
        for (i in data.reply) {
            ids.push(data.reply[i].woeid);
        }
        return ids;
    },
        function (err) {
            // ...
        });

}

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



/*
var params = {
    id:1 
};
cb.__call(
    "trends_place",
    params,
    function (reply) {
       alert(JSON.stringify(reply));
    }
);*/