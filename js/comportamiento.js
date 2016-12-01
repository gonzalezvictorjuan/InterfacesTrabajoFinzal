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
            var trendUrl = trendsOrdenadosPorVolumen[i].url;

            crearNavLateral(trendName, trendVolume, trendUrl);
        }
    }, function(err) {
        console.log("error al obtener los trends mundiales");
    });
}

function crearNavLateral(name,volument, url){
    $("#navTrends").append("<li><a href='"+url+"'>"+name+" - "+volument+"</a></li>");
}
