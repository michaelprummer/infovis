<?php
class Loader {
    var $result;

    function Loader (){
        //$this->options = $options;
        $url = "http://www.medien.ifi.lmu.de/cgi-bin/search.pl?all:all:all:mobile:all";
        $block_counter = 0;

        if (false !== ($this->result = @file_get_contents($url))) {
            $this->result = str_replace("</tr>", "", $this->result);
            $this->result = explode("<tr>", $this->result);


            for ($i=0; $i<count($this->result); $i++) {
                $val = $this->result[$i];

                    if (strpos($val, "year_separator") !== false) {
                        if($block_counter > 0)
                            echo "</div>";

                        $block_counter++;
                        $val = strip_tags($val);
                        echo "<div data-name='$val' class='block'>";
                        echo  "<h1 class='year'>" . $val . "</h1>";

                    } elseif (strpos($val, "<td>") !== false) {
                        echo "<div class='element'>" . $val . "</div>";
                    }
            }

            // Close year block
            if(count($this->result) > 0) {
                echo "</div>";
            }


                //print_r($this->result);
                //echo $this->result;
        } else {
            echo "<p class='error'>Error loading data from: $url</p>";
        }

        //var_dump($this->result);
    }
}



?>

