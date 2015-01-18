"use strict";

$(document).ready(function(){
    $('#error').hide();
    var width = $(window).width() - $("#nav").width() - 25;
    var height = $(window).height();
    var canvas = d3.select("#canvas");
    var svgContainer = canvas.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "svg-container")
            .append("g")
            .attr("id", "viewport");

    var year = new Date().getFullYear();
    var parser = new Parser({svg:svgContainer});
    var layouter = new Layouter({svg:svgContainer,width:width,height:height,parser:parser});
    parser.setLayouter(layouter);


    parser.addFilter({
        year:{
            from:year-5,
            to:year
        }
    });

    $("button").button();
    $('#nav').tabs();
    $("svg").bind("DOMMouseScroll",function(ev){

    });
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
        },
        stop: function(event, ui) {
            var options = {};
            options["name"] = $('#name').val();
            options["paper"] = $('#paper').val();
            parser.callApi(options);
        }
    });
    $( "#amount" ).val(  $( "#yearSlider" ).slider( "values", 0 ) +
    " to " + $( "#yearSlider" ).slider( "values", 1 ) );

    $("#searchAuthor").click(function(ev){
        ev.preventDefault();
        var options = {};
        options["name"] = $('#name').val();
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
    });

    $('.input input').focus(function(ev){
        // show input
        //jquery animate cause of callback.
        if(!$(this).parent().hasClass('showInput')){
            $(this).parent().addClass("showInput");
            $(this).parent().animate({'height':inputHeightExpanded,duration:aniDuration/2});
            $(this).siblings('label').animate({'font-size':'9px'},200);

        }
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
            var options = {};
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
            var options = {};
            options["name"] = ui.item.value;
            //options["year"] = $('#year').val();
            //options["conference"] = $('#conference').val();
            //options["paper"] = $('#paper').val();

            parser.callApi(options);
        }
    })

    $('svg').svgPan('viewport');

    /****************************
     *   Default paper on load  *
     ****************************/
    var options = {};
    options["name"] = $('#name').val();
    options["paper"] = $('#paper').val();
    parser.callApi(options);
})