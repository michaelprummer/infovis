<!DOCTYPE html>
<html>
<head>
    <title>Database Setup</title>
    <meta charset="utf-8">
</head>
<body>
<?php
require_once("Loader.php");

class DB {
    var $db;

    function DB (){
        $this->connect();
    }

    function connect(){
        $this->db = new mysqli("localhost", "root", "");
        if ($this->db->connect_errno) {
            die("Failed to connect to MySQL: (" . $this->db->connect_errno . ") " . $this->db->connect_error);
        }
    }

    function setup(){
        if(!mysqli_select_db($this->db, 'infoVis')){
            mysqli_query($this->db, 'CREATE DATABASE infoVis DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;');
        }

        $this->db->query("CREATE TABLE IF NOT EXISTS authors(
                          id INT NOT NULL AUTO_INCREMENT,
                          lastname VARCHAR(127) NOT NULL,
                          firstname VARCHAR(127) NOT NULL,
                          search_name VARCHAR(127) NOT NULL,
                          PRIMARY KEY(id)
      )");

        $this->loadData();
    }

    function loadData(){
        $loader = new Loader();

        $data = $loader->getRAW();
        //print_r($data);

        foreach($data as $val){
            $year = $val["year"];
            $elements = $val["elements"];

            foreach($elements as $ele){

                foreach($ele["authors"] as $author) {
                    $author = explode(" ", $author);
                    $query = "";

                    if(count($author) == 1) {
                        $name = $author[0];
                        $query = "INSERT INTO `infovis`.`authors` (`id`, `lastname`, `firstname`, `search_name`) VALUES (NULL, '$name', '$name', '$name')";

                    } elseif(count($author) == 2){
                        $search_name = strtolower($author[1]);
                        $lastname = $author[1];
                        $firstname = $author[0];
                        $query = "INSERT INTO `infovis`.`authors` (`id`, `lastname`, `firstname`, `search_name`) VALUES (NULL, '$firstname', '$lastname', '$search_name')";

                    } else {
                        $lastname = ($author[1] == "von")? ($author[2]) : ($author[1] . $author[2]);
                        $search_name = strtolower($lastname);
                        $firstname = $author[0];
                        $query = "INSERT INTO `infovis`.`authors` (`id`, `lastname`, `firstname`, `search_name`) VALUES (NULL, '$firstname', '$lastname', '$search_name')";

                    }

                    $this->db->query($query);

                }
            }
        }

    }

}
?>
</body>
</html>