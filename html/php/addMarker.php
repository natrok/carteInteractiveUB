<?php

/**
 * Copyright (C) 2018
 * Anne Gning (gningannemarie@gmail.com), 
 * Diego Alexander Ramírez Buitrago (diegorok3@yahoo.es),
 * Lydia Zekrini (lydia.zekrini@yahoo.fr),
 * Shervin Sarain (velezsarain@gmail.com)
 *  
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Please send any update at gningannemarie@gmail.com and/or diegorok3@yahoo.es 
 * and/or lydia.zekrini@yahoo.fr and/or velezsarain@gmail.com
 */

require_once ('./connect.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $campus = strval($_POST["campus"]);
    if (!in_array($campus, $campusArray)){
        exit("Campus not set properly");
    }

    $lat = floatval($_POST["lat"]);
    $lng = floatval($_POST["lng"]);
    $bounds = json_decode(file_get_contents('./json/bounds.json'), true);

    if($lat < $bounds[$campus]["minLat"] || $lat > $bounds[$campus]["maxLat"] || $lng < $bounds[$campus]["minLng"] || $lng > $bounds[$campus]["maxLng"]){
        exit("Incorrect geolocation");
    }

    $category = strval($_POST["category"]);
    if (!in_array($category, $categoryArray)){
        exit("Category not set properly");
    }

    $timelimit = intval($_POST["timelimit"]);
    if ($timelimit < 1 || $timelimit > 10 ) {
        exit("Timelimit not set properly");
    }

    $timelimit = ($_SERVER['REQUEST_TIME'] + ($timelimit * 60 * 60));

    $information = strval($_POST["information"]);

    if(is_null($information) || strlen($information) > 256){
        exit("Invalid information length");
    }

    $query = pg_prepare($dbconn, "add_query" ,"INSERT INTO markers(campus, geolocation, add_time, expiry_time, category, information, owner_ip)
  VALUES ($1, point($2, $3), now(), to_timestamp($4), $5, $6, $7)");

    $result = pg_execute($dbconn, "add_query",
        array($campus, $lat, $lng, $timelimit, $category, $information, $_SERVER['REMOTE_ADDR']));
}
else exit("Illegal request");
?>
