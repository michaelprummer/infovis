<?php
/******************************************************************
 * Database handler
 ******************************************************************/

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
        } else {
            $this->db->set_charset("utf8");
            $this->db->select_db("infoVis");
        }
    }

    function setup(){
        if(!mysqli_select_db($this->db, 'infoVis')){
            mysqli_query($this->db, 'CREATE DATABASE infoVis DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;');
        }

        $this->db->query(
            "CREATE TABLE IF NOT EXISTS authors(
                          lastname VARCHAR(127) NOT NULL,
                          firstname VARCHAR(127) NOT NULL,
                          search_name VARCHAR(127) NOT NULL,
                          PRIMARY KEY(search_name)) ENGINE=MyISAM DEFAULT CHARSET=utf8");

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

                    /*
INSERT INTO `table` (value1, value2)
SELECT 'stuff for value1', 'stuff for value2' FROM `table`
WHERE NOT EXISTS (SELECT * FROM `table`
WHERE value1='stuff for value1' AND value2='stuff for value2')
LIMIT 1
*/

                    if(count($author) == 1) {
                        $name = $author[0];
                        $query = "INSERT IGNORE INTO `authors` (`lastname`, `firstname`, `search_name`) VALUES ('$firstname', '$lastname', '$search_name')";

                    } elseif(count($author) == 2){
                        $search_name = strtolower($author[1]);
                        $lastname = $author[1];
                        $firstname = $author[0];
                        $query = "INSERT IGNORE INTO `authors` (`lastname`, `firstname`, `search_name`) VALUES ('$firstname', '$lastname', '$search_name')";

                    } else {
                        $lastname = ($author[1] == "von")? ($author[2]) : ($author[1] . $author[2]);
                        $search_name = strtolower($lastname);
                        $firstname = $author[0];
                        $query = "INSERT IGNORE INTO `authors` (`lastname`, `firstname`, `search_name`) VALUES ('$firstname', '$lastname', '$search_name')";

                    }

                    $this->db->query($query);

                }
            }
        }

    }

    public function getAutoSearchNames($term){
        $a_json = array();
        $data = $this->db->query("SELECT * FROM authors WHERE firstname LIKE '%$term%' OR lastname LIKE '%$term%' ORDER BY lastname LIMIT 25");
        if($data){
            while($row = mysqli_fetch_array($data)) {
                $firstname = (isset($row['firstname']))?($row['firstname']):("");
                $lastname = (isset($row['lastname']))?($row['lastname']):("");
                $a_json_row["value"] = $row['search_name'];
                $a_json_row["label"] = $firstname.' '.$lastname;
                array_push($a_json, $a_json_row);
            }
        }
        return $a_json;
    }

}
?>