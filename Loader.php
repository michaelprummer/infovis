<?php
class Loader
{
    var $result;
    var $content_mode;
    const CONTENTMODE_JSON = 1;
    const CONTENTMODE_HTML = 2;
    const CONTENTMODE_RAW = 3;

    /**
     * Constructor
     */
    function Loader()
    {
    }

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
        if ($this->content_mode == self::CONTENTMODE_HTML) {
            $block_counter = 0;
        } else {
            $json = array();
            $query_counter = 0;
        }

        if (false !== ($this->result = file_get_contents($url))) {
            $this->result = str_replace("</tr>", "", $this->result);
            $this->result = explode("<tr>", $this->result);

            // Iterate search results
            for ($i = 0; $i < count($this->result); $i++) {
                $val = $this->result[$i];

                // YEAR BLOCK
                if (strpos($val, "year_separator") !== false) {
                    $val = strip_tags($val);

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
                                $author = trim(strip_tags(utf8_encode($authors[$i2])));

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
                            $title = trim(strip_tags($val[$k]));
                            if ($this->content_mode == self::CONTENTMODE_HTML) {
                                echo "<div class='title'>" . $title . "</div>";
                            } else {
                                $json[count($json) - 1]["elements"][$query_counter]["title"] = $title;
                            }

                            // DETAILS
                        } elseif ($k == 6) {
                            $details = trim(strip_tags($val[$k]));

                            if ($this->content_mode == self::CONTENTMODE_HTML) {
                                echo "<div class='details'>" . $details . "</div>";
                            } else {
                                $json[count($json) - 1]["elements"][$query_counter]["details"] = $details;
                            }

                            // BIB LINK
                        } elseif ($k == 7) {
                            preg_match('/<a href="(.+)">/', $val[$k], $match);
                            if (count($match) > 0) {
                                $link = trim($match[1]);

                                if ($this->content_mode == self::CONTENTMODE_HTML) {
                                    echo "<div class='bib-link'>" . $link . "</div>";
                                } else {
                                    $json[count($json) - 1]["elements"][$query_counter]["bib-link"] = $link;
                                }
                            }
                        }
                    }
                    if ($this->content_mode == self::CONTENTMODE_HTML) {
                        if (count($this->result) > 0)
                            echo "</div>";
                    }
                    $query_counter++;
                }
            }
            // Close year block
            if ($this->content_mode == self::CONTENTMODE_HTML) {
                if (count($this->result) > 0)
                    echo "</div>";

            } elseif ($this->content_mode == self::CONTENTMODE_JSON || $this->content_mode == self::CONTENTMODE_JSON) {
                return $json;
            }

        } else {
            echo "<p class='error'>Error loading data from: $url</p>";
        }
    }

    function getJson()
    {
        $this->content_mode = self::CONTENTMODE_JSON;
        header('Content-Type: application/json');
        return json_encode($this->parsePubDB());
    }

    function getHTML()
    {
        $this->content_mode = self::CONTENTMODE_HTML;
        $this->parsePubDB();
    }

}

?>