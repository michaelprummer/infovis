<?php require_once("DB.php");
    $db = new DB();
    $id = trim(strip_tags($_POST['id']));
    $db->getPaper($id)["bib"];
    echo json_encode($db->getPaper($id));
?>