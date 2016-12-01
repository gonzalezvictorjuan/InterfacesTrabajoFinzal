function cargarTrendsMundiales() {
    var params = {
        id: 1
    };
    cb.__call(
        "trends_place",
        params
    ).then(function(data) {
        console.log("Obtenidos los trends mundiales");
        var trendsOrdenadosPorVolumen = sortByVolumenVieja(data.reply[0]);
        for (var i = 0; i < 5; i++) {
            var trendName = trendsOrdenadosPorVolumen[i].name;
            var trendVolume = trendsOrdenadosPorVolumen[i].tweet_volume;
            
            crearNavLateral(trendName, trendVolume);
        }
    }, function(err) {
        console.log("error al obtener los trends mundiales");
    });
}

function crearNavLateral(name,volument){
    $("#navTrends").append("<li><a href=\"#\">"+name+" - "+volument+"</a></li>");
}