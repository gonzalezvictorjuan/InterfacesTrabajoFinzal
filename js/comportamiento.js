function cargarTrendsMundiales() {
    var params = {
        id: 1
    };
    cb.__call(
        "trends_place",
        params
    ).then(function (data) {
        console.log("Obtenidos los trends mundiales");
        var trendsOrdenadosPorVolumen = sortByVolumenVieja(data.reply[0]);
        for (var i = 0; i < 5; i++) {
            var trendName = trendsOrdenadosPorVolumen[i].name;
            var trendVolume = trendsOrdenadosPorVolumen[i].tweet_volume;
            var trendUrl = trendsOrdenadosPorVolumen[i].url;

            crearNavLateral(trendName, trendVolume, trendUrl);
        }
    }, function (err) {
        console.log("Error al obtener los trends mundiales");
    });
}


function mostrarError(mensaje) {
    if (!$("#spinner-error").is(':visible')) {
        $("#spinner-trends").hide();
        $("#spinner-tweets").hide();
        $("#errorLoadingText").empty();
        $("#errorLoadingText").append(mensaje);
        $("#spinner-error").show();
        $("#errorLoading").removeClass("pulseYbounceAfuera").addClass("pulseYbounceAdentro");
        $("#errorLoadingText").removeClass("bounceAfuera").addClass("bounceAdentro");
        //alert(mensaje);
    }
}
function ocultarError() {
    $("#errorLoading").removeClass("pulseYbounceAdentro").addClass("pulseYbounceAfuera");
    $("#errorLoadingText").removeClass("bounceAdentro").addClass("bounceAfuera");
    $("#errorLoadingText").one("webkitTransitionEnd animationend oTransitionEnd msTransitionEnd transitionend",
        function (event) {
            // $(this).hide();
            $("#spinner-error").hide();
        }
    );
}
function crearNavLateral(name, volument, url) {
    $("#navTrends").append("<li><a href='" + url + "' target='_blank'>" + name + " - " + volument + "</a></li>");
}
