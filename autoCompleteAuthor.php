<?php require_once("DB.php");
$db = new DB();

$term = trim(strip_tags($_GET['term']));
echo json_encode($db->getAutoSearchNames($term));
?>