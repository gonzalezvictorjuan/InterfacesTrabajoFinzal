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

function calcularMaxCityCount(limit) {
    if (limit <= 425 && limit > 400) {
        maxCityCount = 14;
    } else if (limit <= 400 && limit > 375) {
        maxCityCount = 13;
    } else if (limit <= 375 && limit > 350) {
        maxCityCount = 12;
    } else if (limit <= 350 && limit > 325) {
        maxCityCount = 11;
    } else if (limit <= 325 && limit > 300) {
        maxCityCount = 10;
    } else if (limit <= 300 && limit > 275) {
        maxCityCount = 9;
    } else if (limit <= 275 && limit > 250) {
        maxCityCount = 8;
    } else if (limit <= 250 && limit > 225) {
        maxCityCount = 7;
    } else if (limit <= 225 && limit > 200) {
        maxCityCount = 6;
    } else if (limit <= 200 && limit > 175) {
        maxCityCount = 5;
    } else if (limit <= 175 && limit > 150) {
        maxCityCount = 4;
    } else if (limit <= 150 && limit > 125) {
        maxCityCount = 3;
    } else if (limit <= 125 && limit > 100) {
        maxCityCount = 2;
    } else if (limit <= 100) {
        maxCityCount = 1;
    }
}

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

$(".loadingText").css("left", ($(window).width() / 2)-65);
$(".cargandoTweets").css("left", ($(window).width() / 2)-45);
$(".cargandoTrends").css("left", ($(window).width() / 2)-45);
$(".cargandoError").css("left", ($(window).width() / 2)-45);
$(".cd-header").css("height",($(window).height()*10)/100);
$("#errorLoadingText").css("left", ($(window).width() / 2)-125);
