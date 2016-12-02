var parar = true;

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
        $("#navTrends").empty();
        $("#navTrends").append("<li><span>Trends Mundiales</span></li><hr></hr>");
        for (var i = 0; i < 5; i++) {
            var trendName = trendsOrdenadosPorVolumen[i].name;
            var trendVolume = trendsOrdenadosPorVolumen[i].tweet_volume;
            var trendUrl = trendsOrdenadosPorVolumen[i].url;
            crearNavLateral(trendName, trendVolume, trendUrl);
        }
    }, function(err) {
        console.log("Error al obtener los trends mundiales");
    });
}

function crearNavLateral(name, volument, url) {
    $("#navTrends").append("<li><a href='" + url + "' target='_blank'>" + name + " - " + volument + "</a></li>");
}

var refrescarTrend = setInterval(cargarTrendsMundiales, 60000);

function mostrarError(mensaje) {
    if (!$("#spinner-error").is(':visible')) {
        $("#spinner-trends").hide();
        $("#spinner-tweets").hide();
        $("#errorLoadingText").empty();
        $("#errorLoadingText").append(mensaje);
        $("#spinner-error").show();
        $("#errorLoading").removeClass("pulseYbounceAfuera").addClass("pulseYbounceAdentro");
        $("#errorLoadingText").removeClass("bounceAfuera").addClass("bounceAdentro");
    }
}

function ocultarError() {
    $("#errorLoading").removeClass("pulseYbounceAdentro").addClass("pulseYbounceAfuera");
    $("#errorLoadingText").removeClass("bounceAdentro").addClass("bounceAfuera");
    $("#errorLoadingText").one("webkitTransitionEnd animationend oTransitionEnd msTransitionEnd transitionend",
        function(event) {
            $("#spinner-error").hide();
        }
    );
}

$("#main-nav").find("a").on("click", function() {
    $("#main-nav").removeClass();
    $("#ShadowLayer").removeClass("is-visible");
    $("#cd-main-content").removeClass();
});


$(".qs").on("click", function() {
    $('#MyModalQS').modal('show');
    console.log('#MyModalQS');
});
$(".cont").on("click", function() {
    $('#contactoModal').modal('show');
});
$(".cf").on("click", function() {
    $('#MyModalCF').modal('show');
    console.log('#MyModalCF');
});
$(".is").on("click", function() {
    $('#MyModalIS').modal('show');
    console.log('#MyModalIS');
});
