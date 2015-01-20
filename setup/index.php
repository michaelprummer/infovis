<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>Setup</title>
    <script type ="text/javascript" src="../js/jquery-2.1.1.min.js"></script>
</head>
<body id="body">

<input id="start" type="button" onclick="start();" value="Start Setup" />
<div id="output"></div>
<script>
    var i = 0;

    function start(){
        $("#start").remove();
        $("#output").html("Crawling data...");
        $.ajax({
            url: "SetupPubDB.php"
        }).done(function(d){
            $("#output").html("PubDB DONE")
            //dbpl();
        })
    }

    function dbpl(){
        $('body').append("<p>crawling dbpl:</p>");
        $('body').append("<div id='loader-dbpl'>0%</div>");
        loaddbpl()
    }
    function loaddbpl(){
        setTimeout(function(){
            $.ajax({
                url: "SetupDBLB.php",
                type: "post",
                data: {'var0' : i}
            })
            i++;
            $("#loader-dbpl").html((i/25)*100 + "%")
            if (i < 25){
                loaddbpl()
            }
        }, 2000);

    }
</script>

</body>
</html>