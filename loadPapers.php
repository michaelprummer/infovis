<?php require_once("DB.php");
    $db = new DB();
    $title = trim(strip_tags($_POST['title']));
    echo json_encode($db->getPaper($title));
?>