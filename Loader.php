<?php
class Loader
{
    private $lmuApiResult;
    private $dblpApiResult;
    private $content_mode;
    private $indexer = 0;
    const CONTENTMODE_JSON = 1;
    const CONTENTMODE_HTML = 2;
    const CONTENTMODE_RAW = 3;

    /**
     * Parses the search query result
     */
    private function parsePubDB()
    {
        $options = "";
        // Set Options
        for ($i = 0; $i < 5; $i++) {
            if (isset($_POST['param' . $i]) && $_POST['param' . $i] != "") {
                if ($i > 0)
                    $options = $options . ":";
                $options = $options . strtolower($_POST['param' . $i]);

            } else {
                if ($i == 0)
                    $options = $options . "all";
                else
                    $options = $options . ":all";
            }
        }
        // API URL
        $url = "http://www.medien.ifi.lmu.de/cgi-bin/search.pl?" . $options;
        $query_counter = 0;
        $block_counter = 0;
        $json = array();

        if (false !== ($this->lmuApiResult = file_get_contents($url))) {
            $this->lmuApiResult = str_replace("</tr>", "", $this->lmuApiResult);
            $this->lmuApiResult = explode("<tr>", $this->lmuApiResult);

            // Iterate search results
            for ($i = 0; $i < count($this->lmuApiResult); $i++) {
                $val = $this->lmuApiResult[$i];

                // YEAR BLOCK
                if (strpos($val, "year_separator") !== false) {
                    $val = utf8_encode(strip_tags($val));
                    if ($this->content_mode == self::CONTENTMODE_HTML) {
                        if ($block_counter > 0)
                            echo "</div>";
                        $block_counter++;
                        echo "<div data-name='$val' class='block'>";
                        echo "<h1 class='year'>" . $val . "</h1>";

                    } else {
                        array_push($json, ["year" => $val, "elements" => []]);
                        $query_counter = 0;
                    }


                // ELEMENT BLOCK
                } elseif (strpos($val, "<td>") !== false) {
                    $val = explode("\n", $val);

                    if ($this->content_mode == self::CONTENTMODE_HTML) {
                        echo "<div class='element'>";
                    }

                    for ($k = 0; $k < count($val); $k++) {
                        // AUTHORS
                        if ($k == 2) {
                            if ($this->content_mode == self::CONTENTMODE_HTML) {
                                echo "<ul class='authors'>";
                            } else {
                                $json[count($json) - 1]["elements"][$query_counter]["authors"] = array();
                            }

                            $authors = explode(",", $val[$k]);
                            for ($i2 = 0; $i2 < count($authors); $i2++) {
                                $author = utf8_encode(trim(strip_tags($authors[$i2])));

                                if ($this->content_mode == self::CONTENTMODE_HTML) {
                                    echo "<li>" . $author . "</li>";
                                } else {
                                    array_push($json[count($json) - 1]["elements"][$query_counter]["authors"], $author);
                                }

                            }

                            if ($this->content_mode == self::CONTENTMODE_HTML) {
                                echo "</ul>";
                            }

                            // TITLE
                        } elseif ($k == 4) {
                            $title = utf8_encode(trim(strip_tags($val[$k])));
                            if ($this->content_mode == self::CONTENTMODE_HTML) {
                                echo "<div class='title'>" . $title . "</div>";
                            } else {
                                $json[count($json) - 1]["elements"][$query_counter]["title"] = $title;
                            }

                            // DETAILS
                        } elseif ($k == 6) {
                            $details = utf8_encode(trim(strip_tags($val[$k])));

                            if ($this->content_mode == self::CONTENTMODE_HTML) {
                                echo "<div class='details'>" . $details . "</div>";
                            } else {
                                $json[count($json) - 1]["elements"][$query_counter]["details"] = $details;
                            }

                            // BIB LINK
                        } elseif ($k == 7) {
                            preg_match('/<a href="(.+)">/', $val[$k], $match);
                            if (count($match) > 0) {
                                $link = utf8_encode(trim($match[1]));

                                if ($this->content_mode == self::CONTENTMODE_HTML) {
                                    echo "<div class='bib-link'>" . $link . "</div>";

                                } elseif($this->content_mode == self::CONTENTMODE_JSON){
                                    $json[count($json) - 1]["elements"][$query_counter]["bib_link"] = $link;
                                } else {
                                    $bib_url = "http://www.medien.ifi.lmu.de" . $link ;
                                    $bib_res = "none";

                                    // Add Keywords separate
                                    if (false !== ($bib_res = file_get_contents($bib_url))) {
                                        $tmp = explode("keywords", $bib_res);

                                        if(isset($tmp) && count($tmp) == 2) {
                                            $keywords = $tmp[1];
                                            $keywords = str_replace(" = {", "", $keywords);
                                            $keywords = str_replace("}", "", $keywords);
                                            $json[count($json) - 1]["elements"][$query_counter]["keywords"] = $keywords;
                                        } else {
                                            $json[count($json) - 1]["elements"][$query_counter]["keywords"] = "none";
                                        }
                                    }

                                    $bib_res = str_replace("@", "[", $bib_res);
                                    $bib_res = $bib_res . "]";
                                    $json[count($json) - 1]["elements"][$query_counter]["bib_link"] = $bib_res;
                                }

                            } else {
                                if(!$this->content_mode == self::CONTENTMODE_HTML){
                                    $json[count($json) - 1]["elements"][$query_counter]["bib_link"] = "";
                                }
                            }
                        }


                    }

                    $json[count($json) - 1]["elements"][$query_counter]["paper_index"] = $this->indexer;
                    $this->indexer++;

                    if ($this->content_mode == self::CONTENTMODE_HTML) {
                        if (count($this->lmuApiResult) > 0)
                            echo "</div>";
                    }
                    $query_counter++;
                }
            }

            // Close year block
            if ($this->content_mode == self::CONTENTMODE_HTML) {
                if (count($this->lmuApiResult) > 0)
                    echo "</div>";

            } elseif ($this->content_mode == self::CONTENTMODE_JSON || $this->content_mode == self::CONTENTMODE_RAW) {
                return $json;
            }

        } else {
            echo "<p class='error'>Error loading data from: $url</p>";
        }
    }

    function getJson() {
        $this->content_mode = self::CONTENTMODE_JSON;
        $json = $this->parsePubDB();

        header('Content-Type: application/json');
        echo json_encode($json);
    }

    function getHTML() {
        $this->content_mode = self::CONTENTMODE_HTML;
        $this->parsePubDB();
    }

    function getRAW() {
        $this->content_mode = self::CONTENTMODE_RAW;
        return $this->parsePubDB();
    }


    function parseDBLP($name) {
        $new_name = $name;
        if($name == "Hussmann:Heinrich"){
            $new_name = "Hu=szlig=mann:Heinrich";
        }elseif($name == "DeLuca:Alexander"){
            $new_name = "Luca:Alexander_De";
        } else {
            $new_name = $name;
        }
        $url = "http://www.informatik.uni-trier.de/~ley/pers/xx/" . strtolower(substr(trim($name),0,1)) . "/" . $new_name;

        if (false !== ($this->dblpApiResult = file_get_contents($url))) {
            if(!(false !== strpos($this->dblpApiResult, "Got illegal request"))){
                return $this->dblpApiResult;
            }
        }
    }
}

?>