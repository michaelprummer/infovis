<?php
class Loader {
    var $result;

    function Loader (){
        //$this->options = $options;
        $this->parsePubDB();
    }

    function parsePubDB(){
        $url = "http://www.medien.ifi.lmu.de/cgi-bin/search.pl?all:all:all:all:all";
        $block_counter = 0;
        if (false !== ($this->result = @file_get_contents($url))) {
            $this->result = str_replace("</tr>", "", $this->result);
            $this->result = explode("<tr>", $this->result);


            for ($i=0; $i<count($this->result); $i++) {
                $val = $this->result[$i];

                // YEAR BLOCK
                if (strpos($val, "year_separator") !== false) {
                    if($block_counter > 0)
                        echo "</div>";

                    $block_counter++;
                    $val = strip_tags($val);
                    echo "<div data-name='$val' class='block'>";
                    echo  "<h1 class='year'>" . $val . "</h1>";

                // ELEMENT BLOCK
                } elseif (strpos($val, "<td>") !== false) {
                    echo "<div class='element'>";
                    $val = explode("\n", $val);

                    for ($k=0; $k<count($val); $k++) {
                        if($k == 2) {
                            echo "<ul class='authors'>";
                            $authors = explode(",", $val[$k]);
                            for($i2=0;$i2<count($authors);$i2++){
                                $author = $authors[$i2];
                                echo "<li>" . $author . "</li>";

                            }
                            echo "</ul>";
                        } elseif ($k == 4) {
                            echo "<div class='title'>" . strip_tags($val[$k], "<a>") . "</div>";

                        } elseif ($k == 6) {
                            echo "<div class='details'>" . strip_tags($val[$k]) . "</div>";

                        } elseif ($k == 7) {
                            preg_match('/<a href="(.+)">/', $val[$k], $match);
                            if(count($match) > 0)
                                echo "<div class='bib-link'>" . $match[1] . "</div>";
                            else
                                echo "<div class='bib-link'></div>";
                        }

                    }

                    echo "</div>";
                }
            }

            // Close year block
            if(count($this->result) > 0) {
                echo "</div>";
            }

        } else {
            echo "<p class='error'>Error loading data from: $url</p>";
        }

        //var_dump($this->result);

    }

}



?>

