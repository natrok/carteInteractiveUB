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

    $time = intval($_POST["time"]);

    $query = pg_prepare($dbconn, "get_query" ,"SELECT id, geolocation[0] AS lat, geolocation[1] AS lng, category, information
        FROM markers WHERE campus=$1 AND now() < expiry_time AND add_time > to_timestamp($2)");

    $result = pg_execute($dbconn, "get_query", array($campus, $time));

    $resultArray = array();

    while ($row = pg_fetch_assoc($result)) {
        $resultArray[] = $row;
    }

    echo json_encode($resultArray);
}
else exit("Illegal request");
