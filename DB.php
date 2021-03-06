<?php
/******************************************************************
 * Database handler
 ******************************************************************/

require_once("Loader.php");

class DB {
    var $db;
    var $loader;

    function DB (){
        $this->connect();
        $this->loader = new Loader();
    }

    function connect(){
        $config = parse_ini_file("setup/config.ini", TRUE);
        $this->db = new mysqli($config["database"]["host"], $config["database"]["user"], $config["database"]["password"]);
        mysqli_report(MYSQLI_REPORT_ERROR);

        if ($this->db->connect_errno) {
            die("Failed to connect to MySQL: (" . $this->db->connect_errno . ") " . $this->db->connect_error);
        } else {
            $this->db->set_charset("utf8");
            $this->db->select_db($config["database"]["name"]);
        }
    }

    function setup(){
        if(!mysqli_select_db($this->db, 'infoVis')){
            mysqli_query($this->db, 'CREATE DATABASE infoVis DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;');
            mysqli_select_db($this->db, 'infoVis');
        }

        $this->db->query("DROP Table authors");
        $this->db->query("DROP Table papers");
        $this->db->query("DROP Table authors_papers");
        $this->db->query("DROP Table extern_dblp");

        $this->db->query("CREATE TABLE IF NOT EXISTS authors(
                             lastname VARCHAR(127) NOT NULL,
                             firstname VARCHAR(127) NOT NULL,
                             search_name VARCHAR(127) NOT NULL,
                          PRIMARY KEY(search_name)) ENGINE=MyISAM DEFAULT CHARSET=utf8");

        $this->db->query("CREATE TABLE IF NOT EXISTS papers(
                              id INT NOT NULL AUTO_INCREMENT,
                              title VARCHAR(255) NOT NULL,
                              year VARCHAR(63) NOT NULL,
                              bib VARCHAR(16383) NOT NULL,
                              keywords VARCHAR(2047) NOT NULL,
                              details VARCHAR(127) NOT NULL,
                          PRIMARY KEY(id)) ENGINE=MyISAM DEFAULT CHARSET=utf8");

        $this->db->query("CREATE TABLE IF NOT EXISTS authors_papers(
                              id INT NOT NULL,
                              search_name VARCHAR(127) NOT NULL,
                              FOREIGN KEY(id) REFERENCES papers(id),
                              FOREIGN KEY(search_name) REFERENCES authors(search_name),
                              PRIMARY KEY(id, search_name)) ENGINE=MyISAM DEFAULT CHARSET=utf8");

        $this->db->query("CREATE TABLE IF NOT EXISTS extern_dblp(
                              id INT NOT NULL AUTO_INCREMENT,
                              search_name VARCHAR(127) NOT NULL,
                              content VARCHAR(16383),
                              FOREIGN KEY(search_name) REFERENCES authors(search_name),
                              PRIMARY KEY(id, search_name)) ENGINE=MyISAM DEFAULT CHARSET=utf8");

        $this->loadData();
    }

    function clean($string) {
        $string = str_replace(' ', '-', $string);
        $string = preg_replace('/[^A-Za-z0-9\-]/', '', $string);
        $string = preg_replace('/-+/', '-', $string);

        return str_replace('-', ' ', $string);
    }

    function loadData(){
        echo "Crawling data, please wait.<br>";
        $data = $this->loader ->getRAW();
        //print_r($data);

        foreach($data as $val){
            $year = $val["year"];
            $elements = $val["elements"];

            foreach($elements as $ele){
                $title =  (isset($ele['title']))? ($this->clean($ele['title'])) : ("");
                $details = (isset($ele['details']))? ($this->clean($ele['details'])) : ("");
                $bib_link = (isset($ele['bib_link']))? ($this->clean($ele['bib_link'])) : ("");
                $keywords = (isset($ele['keywords']))? ($this->clean($ele['keywords'])) : ("");
                //if(isset($ele['keywords']))
                    //echo "keywords: " . $ele['keywords'];

                $this->db->query("INSERT INTO `papers`(`title`, `year`, `bib`, `keywords`, `details`) VALUES ('$title', '$year', '$bib_link', '$keywords', '$details')");

                $id = mysqli_fetch_array($this->db->query("SELECT id FROM papers ORDER BY id DESC LIMIT 1"))[0];

                foreach($ele["authors"] as $author) {
                    $author = explode(" ", $author);

                    $error1 = null;
                    $error2 = null;

                    if(count($author) == 1) {
                        $name = $this->clean($author[0]);
                        $error1 = $this->db->query("INSERT IGNORE INTO authors (lastname, firstname, search_name) VALUES ('$name', '$name', '$name')");
                        $error2 = $this->db->query("INSERT IGNORE INTO authors_papers (id, search_name) VALUES ('$id', '$name')");

                    } elseif(count($author) == 2){
                        $search_name = strtolower($this->clean($author[1]));
                        $lastname = $this->clean($author[1]);
                        $firstname = $this->clean($author[0]);
                        $error1 = $this->db->query("INSERT IGNORE INTO authors (lastname, firstname, search_name) VALUES ('$lastname', '$firstname', '$search_name')");
                        $error2 = $this->db->query("INSERT IGNORE INTO authors_papers (id, search_name) VALUES ('$id', '$search_name')");

                    } else {
                        $lastname = ($author[1] == "von")? ($this->clean($author[2])) : ($this->clean($author[1]) . $this->clean($author[2]));
                        $search_name = strtolower($lastname);
                        $firstname = $this->clean($author[0]);
                        $error1 = $this->db->query("INSERT IGNORE INTO authors (lastname, firstname, search_name) VALUES ('$lastname', '$firstname', '$search_name')");
                        $error2 = $this->db->query("INSERT IGNORE INTO authors_papers (id, search_name) VALUES ('$id', '$search_name')");
                    }

                    if(!$error1) {
                        print_r($error1);
                    }

                    if(!$error2) {
                        print_r($error2);
                    }

                }
            }
        }
        return true;
    }

    function loadDBLPData($rowNum){
        $start = $rowNum*25;
        $query = "SELECT * FROM authors ORDER BY lastname ASC LIMIT $start, 25 ";
        $data = $this->db->query($query);
        $num_rows = $data->num_rows;

        if($data){
            while($row = mysqli_fetch_array($data)) {
                $firstname = (isset($row['firstname']))?($row['firstname']):("");
                $lastname = (isset($row['lastname']))?($row['lastname']):("");
                $search_name = (isset($row['search_name']))?($row['search_name']):("");
                $result = $this->loader->parseDBLP($lastname . ":" . $firstname);
                if(isset($result) && $result != ""){
                    $result = $xml = simplexml_load_string($result);
                    $json = json_encode($xml);

                    $this->db->query("INSERT IGNORE INTO extern_dblp (search_name, content) VALUES ('$search_name', '$json')");
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

    public function getAutoSearchPaper($term){
        $term = $this->clean($term);
        $a_json = array();
        $data = $this->db->query("SELECT * FROM papers WHERE title LIKE '%$term%' LIMIT 50");

        if($data){
            while($row = mysqli_fetch_array($data)) {
                $title = (isset($row['title']))?($row['title']):("");
                $a_json_row["value"] = $title;
                $a_json_row["label"] = $title;
                array_push($a_json, $a_json_row);
            }
        }
        return $a_json;
    }

    public function getPaper($title) {
        $a_json_row = array();
        $title = $this->clean($title);
        $data = $this->db->query("SELECT * FROM papers WHERE title LIKE '%$title%' LIMIT 1");
        $id = 0;

        if($data){
            while($row = mysqli_fetch_array($data)) {
                $id = $row['id'];
                $title = (isset($row['title']))?($row['title']):("");
                $bib = (isset($row['bib']))?($row['bib']):("");
                $year = (isset($row['year']))?($row['year']):("");
                $keywords = (isset($row['keywords']))?($row['keywords']):("");
                $details = (isset($row['details']))?($row['details']):("");
                    $a_json_row["id"] = $id;
                    $a_json_row["year"] = $year;
                    $a_json_row["title"] = $title;
                    $a_json_row["keywords"] = $keywords;
                    $a_json_row["details"] = $details;
                    $a_json_row["bib"] = $bib;
                }
            }
            $authordata = $this->db->query("SELECT * FROM authors_papers WHERE id = $id");
            if($authordata){
                 $authors = [];
                while($row = mysqli_fetch_array($authordata)) {
                    $author = (isset($row['search_name']))?($row['search_name']):("");
                    array_push($authors,$author);
                }
                $a_json_row["authors"] = $authors;
            }
            return $a_json_row;
        }
}
?>