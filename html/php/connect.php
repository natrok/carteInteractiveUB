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

    $conn_string = "host=localhost port=5432 dbname=carteInteractive user=postgres password=password";
    $dbconn = pg_connect($conn_string) or die('Database connection error');
    $campusArray = array("talence", "carreire");
    $categoryArray = array("information", "forbidden", "disabled");
?>
