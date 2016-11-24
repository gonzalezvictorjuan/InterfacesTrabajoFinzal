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
