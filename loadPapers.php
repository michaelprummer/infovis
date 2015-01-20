<?php require_once("DB.php");
    $db = new DB();
    $title = trim(strip_tags($_POST['id']));
    echo json_encode($db->getPaper($title));
?>