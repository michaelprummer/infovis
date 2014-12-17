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
            mysqli_query($this->db, 'CREATE DATABASE infoVis');
        }

        $this->db->query("CREATE TABLE IF NOT EXISTS authors(
                          id INT NOT NULL AUTO_INCREMENT,
                          lastname VARCHAR(200) NOT NULL,
                          firstname VARCHAR(200) NOT NULL,
                          PRIMARY KEY(id)
      )");

        $this->loadData();
    }

    function loadData(){
        $loader = new Loader();
        $data = $loader->getRAW();
        print_r($data);

    }

}