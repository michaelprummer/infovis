$(document).ready(function(ev){
    $('#error').hide();
    var width = 1000;
    var height = 800;
    var canvasId="canvas";
    var canvas = d3.select("#canvas");
    var svgContainer = canvas.append("svg")
        .attr("width", 1000)
        .attr("height", 800)
        .attr("id", "svg-container")
    //.attr('viewBox', "0 0 "+parseInt(width, 10)+" "+parseInt(height, 10));
    // viewbox ist awesome für navigation in unserem graphen, eingebauter zoom + bildausschnitt
    var year = new Date().getFullYear();

    var parser = new Parser({svg:svgContainer});
    parser.addFilter({
        year:{
            from:year-5,
            to:year
        }
    });

    $("button").button();
    $('#nav').tabs();
    $( "#yearSlider" ).slider({
        range: true,
        min: year-20,
        max: year,
        values: [ year-5, year ],
        slide: function( event, ui ) {
            $( "#amount" ).val( ui.values[ 0 ] + " to " + ui.values[ 1 ] );
            parser.addFilter({
                year:{
                    from:ui.values[ 0 ],
                    to:ui.values[ 1 ]
                }
            });
        }
    });
    $( "#amount" ).val(  $( "#yearSlider" ).slider( "values", 0 ) +
    " to " + $( "#yearSlider" ).slider( "values", 1 ) );


    $("#searchAuthor").click(function(ev){
        ev.preventDefault();
        options = {};
        options["name"] = $('#name').val();
        //options["year"] = $('#year').val();
        //options["conference"] = $('#conference').val();
        options["paper"] = $('#paper').val();

        parser.callApi(options);
    });


    // SEARCH FORM ANIMATING INPUTS:
    var aniDuration = 200;
    var inputHeightExpanded = '50px';
    var inputHeightCollapsed = '22px';

    $('.input label').click(function(ev){
        // show input
        ev.preventDefault();
        //jquery animate cause of callback.
        $(this).parent().addClass("showInput");
        $(this).parent().animate({'height':inputHeightExpanded,duration:aniDuration/2});
        $(this).animate({'font-size':'9px'},aniDuration,function() {$(this).siblings('input').focus()});
        //css animation method
        // var input = $(this).parent().addClass("showInput");
        //$(this).addClass("small");
        //$(this).parent().find('input').focus();


    });
    $('.input input').focus(function(ev){
        // show input
        //jquery animate cause of callback.
        if(!$(this).parent().hasClass('showInput')){
            $(this).parent().addClass("showInput");
            $(this).parent().animate({'height':inputHeightExpanded,duration:aniDuration/2});
            $(this).siblings('label').animate({'font-size':'9px'},200);

        }
        //css animation method
        // var input = $(this).parent().addClass("showInput");
        //$(this).addClass("small");
        //$(this).parent().find('input').focus();


    });

    // Clear Input field on click
    $('#name').on("click", function (){
        $(this).val("");
    })

    $('.input input').blur(function(ev){
        // show input
        if($(this).val() == ""){
            $(this).parent().removeClass("showInput");
            $(this).parent().animate({'height':inputHeightCollapsed,duration:aniDuration});
            $(this).siblings('label').animate({'font-size':'11px'},aniDuration);
        }
        //jquery animate cause of callback.
        //css animation method
        // var input = $(this).parent().addClass("hideInput");
    });

    /* * * * * * * * * * *
     *     AUTOSEARCH    *
     * * * * * * * * * * */
    $("input[name=name]").autocomplete({
        source: 'autoCompleteAuthor.php',
        delay: 200,
        minChars: 1,
        cache:	true,
        select: function(event, ui) {
            options = {};
            options["name"] = ui.item.value;
            //options["year"] = $('#year').val();
            //options["conference"] = $('#conference').val();
            //options["paper"] = $('#paper').val();

            parser.callApi(options);
        }
    })

    $("input[name=paper]").autocomplete({
        source: 'autoCompletePaper.php',
        delay: 200,
        minChars: 1,
        cache:	true,
        select: function(event, ui) {
            options = {};
            options["name"] = ui.item.value;
            //options["year"] = $('#year').val();
            //options["conference"] = $('#conference').val();
            //options["paper"] = $('#paper').val();

            parser.callApi(options);
        }
    })


    /****************************
     *          TEST            *
     ****************************/
    options = {};
    options["name"] = $('#name').val();
    options["paper"] = $('#paper').val();
    parser.callApi(options);
})