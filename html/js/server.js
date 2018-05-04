/*
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

//vérification côté client des données envoyées (une deuxième vérification côté serveur est faite)
function validateData(data){
    if (!map.campusSet.has(data.campus)) {
        Materialize.toast(map.languageStrings.error.dataCampusInvalid[map.currentLanguage], 4000);
        return false;
    }

    else if (!map.categorySet.has(data.category)){
        Materialize.toast(map.languageStrings.error.dataCampusInvalid[map.currentLanguage], 4000);
        return false;
    }

    else if (data.lat < map.mapBounds.getSouth() || data.lat > map.mapBounds.getNorth()
        || data.lng < map.mapBounds.getWest() || data.lng > map.mapBounds.getEast()){
        Materialize.toast(map.languageStrings.error.dataCoordinatesInvalid[map.currentLanguage], 4000);
        return false;
    }

    else if (!($.type(data.information) === "string") || data.information.length === 0 || data.information.length > 256){
        Materialize.toast(map.languageStrings.error.dataInformationInvalid[map.currentLanguage], 4000);
        return false;
    }

    else if (data.timelimit < 1 || data.timelimit > 10){
        Materialize.toast(map.languageStrings.error.dataTimelimitInvalid[map.currentLanguage], 4000);
        return false;
    }

    else return true;
}

//envoi du marqueur au serveur
function submitMarker(campus, lat, lng, timelimit,  category, information){
    var data = {
        campus: campus,
        lat: lat,
        lng: lng,
        category: category,
        timelimit: timelimit,
        information: information
    };

    if (validateData(data)){
        $.post("http://localhost/php/addMarker.php", data, function( result ) {
            loadRecentMarkers();
            clearForm();
        });
        map.leafletMap.closePopup();
    }
}

//chargement des limites d'un campus et initialisation de tous les objets qui en dépendent
function loadBounds(campus){
    if (map.campusSet.has(campus)){
        $.getJSON( "http://localhost/php/json/bounds.json", function( data ) {
            var southWest = L.latLng(data[campus].minLat, data[campus].minLng);
            var northEast = L.latLng(data[campus].maxLat, data[campus].maxLng);
            map.mapBounds = L.latLngBounds(southWest, northEast);
            map.currentCampus = campus;
            map.leafletMap.setView(map.mapBounds.getCenter(), 17);
            map.leafletMap.setMaxBounds(map.mapBounds);
            instantiateSearch();
            map.geocodingControl.addTo(map.leafletMap);
            instantiateDirections();
            loadBuildings(campus);
            loadAllMarkers(campus);
            setInterval(loadRecentMarkers, 20000);
        });
    }
    else Materialize.toast(map.languageStrings.error.loadDataError[map.currentLanguage], 4000);
}

//change le campus actuel, nettoie la carte
function changeCampus(campus){
    $('.dropdown-button').dropdown('close');
    if (map.campusSet.has(campus) && !(map.currentCampus === campus)){
        $.each(map.layerGroups, function (index, value) {
            map.layerGroups[index].clearLayers();
        });

        if(map.routingActive){
            map.leafletMap.removeControl(map.routingControl);
            $("#btn-clear-directions").removeClass("scale-in");
            map.routingActive = false;
        }
        else{
            map.leafletMap.removeControl(map.geocodingControl);
        }
        loadBounds(campus);
    }
}

//chargement de tous les marqueurs d'un campus
function loadAllMarkers(){
    var data = {
        campus: map.currentCampus
    };
    $.post("http://localhost/php/getMarkers.php", data, function( result ) {
        //var markers = result;
        $.each(result, function(index, value){
            addMarker(value);
        });

        map.lastRequestTime = Math.floor((new Date).getTime()/1000);
    }, "json");
}

//chargement des nouveaux marqueurs depuis la dernière requête
function loadRecentMarkers(){
    var data = {
        campus: map.currentCampus,
        time: map.lastRequestTime
    };
    $.post("http://localhost/php/getMarkersInterval.php", data, function( result ) {
        //var markers = result;
        $.each(result, function(index, value){
            addMarker(value);
        });

        map.lastRequestTime = Math.floor((new Date).getTime()/1000);
    }, "json");
}

//chargement des bâtiments d'un campus
function loadBuildings(campus){
    if (map.campusSet.has(campus)){
        $.getJSON( "http://localhost/php/json/buildings.json", function( data ) {
            $.each(data[campus], function(index, value){
                addMarker(value);
            });
        });
    }
    else Materialize.toast("Impossible de charger les informations du campus", 4000);
}

//chargement des strings qui contiennent les traductions
function loadLanguageStrings(){
    $.getJSON( "http://localhost/php/json/javascriptStrings.json", function( data ) {
        map.languageStrings = data;
        initialiseApp();
    });
}

//obtient le langage du navigateur pour le premier lancement de l'application
function getNavigatorLanguage(){
    var navLang = navigator.language;
    //récupérer les premiers 2 caractères
    navLang = navLang.substring(0,2);

    switch(navLang){
        case 'fr' :
            map.currentLanguage = 'fr';
            break;
        case 'en' :
            map.currentLanguage = 'en';
            break;
        case 'es':
            map.currentLanguage = 'es';
            break;
        default:
            map.currentLanguage = 'fr';
            break;
    }
}

//change la langue de l'application
function changeLanguage(language){
    $('.dropdown-button').dropdown('close');
    if (!(map.currentLanguage === language)){
        map.currentLanguage = language;
        $("[data-localize]").localize("/php/json/application", { language: language });

        if(map.routingActive){
            map.leafletMap.removeControl(map.routingControl);
            $("#btn-clear-directions").removeClass("scale-in");
            map.routingActive = false;
        }
        else{
            map.leafletMap.removeControl(map.geocodingControl);
        }

        instantiateSearch();
        instantiateDirections();
        initializeFilter();
        map.geocodingControl.addTo(map.leafletMap);
    }
}
