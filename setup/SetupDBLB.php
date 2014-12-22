<?php require_once("../DB.php");
    $db = new DB();
    $var = $_POST["var0"];
    $db->loadDBLPData($var);
?>
