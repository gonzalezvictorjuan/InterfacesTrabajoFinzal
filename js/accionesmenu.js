$(document).ready(function() {
    "use strict";

    function InicializarEventosDspCarga() {

        if ($("#AjaxContent div:first").hasClass("filtro")) {
            $('#media').carousel({
                pause: true,
                interval: false,
            });
        } else {
            $("#btnFiltro").off().on("click", prepararBotonMenuFiltro);
            $("#btnFiltro2").off().on("click", prepararBotonMenuFiltro);
        }
        // Funcion que inicializa los eventos que afectaran a los contenidos cargados con partial render luego de su carga
    }

    function prepararBotonMenuFiltro() {
        $("nav ul li:last").trigger("click");
    }

    function ActualizarContenido(ev) {
        // Funcion que realizará un partial render al clickear un elemento de nuestro nav
        var pagina = $(this).attr("menu") + ".html"; // Insertamos en la variable pagina nuestro atributo href de los li
        if (!($(this).hasClass("secciones"))) {
            $("nav ul li").removeClass("active");
            $(this).addClass("active");
        }
        $.ajax({
            url: pagina,
            dataType: "html",
            success: function(data) { // Si la solicitud tuvo exito, mostrará el contenido en la pagina y
                $("#AjaxContent").html(data); //buscará si está la tabla o no, ademas de inicializar los eventos posteriores
                InicializarEventosDspCarga(data);
            },
            error: function(data) {
                $("#AjaxContent").text("Hubo un error en la red.");
            }
        });
        ev.preventDefault();
    }

    $(".secciones li").on("click", ActualizarContenido);
    $("nav ul li").on("click", ActualizarContenido); // Ejecutará el partial render. Se uso el tag li por ser el que tenga la clase active
    $("nav ul li").on("click", ActualizarContenido);
    $(".navbar-brand").on("click", function() {
        $("nav ul li:first").trigger('click');
    })
    $("nav ul li:first").trigger("click"); // Ejecuta por primera vez el evento de hacer click en "Inicio" cuando se cargue la pagina
});
