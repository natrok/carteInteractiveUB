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

var map = {
    leafletMap: "",
    mapBounds: "",
    currentCampus: "",
    campusSet: new Set(["talence", "carreire"]),
    icons: "",
    layerGroups: "",
    filterControl: "",
    categorySet: new Set(["information", "forbidden", "disabled"]),
    geoOptions: "",
    geocodingControl: "",
    routingControl: "",
    routingActive: false,
    positionMarker: "",
    selectedPosition: "",
    popupDom: "",
    lastRequestTime: 0,
    currentLanguage: "",
    languageStrings: ""
};

function instantiateMap() {
    //initialise le plan,
    map.leafletMap = L.map('campus-map');
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2hlbGFub2lyIiwiYSI6ImNpejE2OXhuMzAwMHoycW9ka2NvYXNyZm4ifQ.PQCji8OkiNDuIAnHDKG8GA', {
        minZoom: 15,
        maxZoom: 19,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(map.leafletMap);

    map.popupDom = L.popup({
        closeButton: false,
        minWidth: 150,
    }).setContent(L.DomUtil.get('map-context-menu'));

    //exécute onMapRightClick lors d'un click droit sur le plan
    map.leafletMap.on('contextmenu', this.onMapRightClick);

    L.easyButton( '<i class="material-icons" title="Geolocalisation" style="font-size: 18px; vertical-align: text-bottom;">my_location</i>', function(){
        getGeolocation();
    }).addTo(map.leafletMap);

    map.geoOptions = {
        enableHighAccuracy: false,
        maximumAge: 30000,
        timeout: 15000
    };
}

//initialise la barre de recherches
function instantiateSearch() {
    map.geocodingControl = L.Control.geocoder({
        //on utilise un serveur Norminatim
        geocoder: L.Control.Geocoder.nominatim({
            serviceUrl: "http://localhost/nominatim/",
            geocodingQueryParams: {
                //résultats en français
                'accept-language': map.currentLanguage,
                //on restreint les résultats sur le campus
                viewbox: [map.mapBounds.getWest(), map.mapBounds.getNorth(), map.mapBounds.getEast(), map.mapBounds.getSouth()],
                bounded: 1
            }
        }),
        //barre toujours visible
        collapsed: false,
        //remplacement du comportement par défaut lors de la recherche
        placeholder: map.languageStrings.search.placeholder[map.currentLanguage],
        errorMessage: map.languageStrings.search.error[map.currentLanguage]
    })
}

//initialise le système de calcul de directions
function instantiateDirections () {
    //initialise le système de calcul de directions
    map.routingControl = L.Routing.control({
        serviceUrl: 'http://localhost:5000/route/v1',
        geocoder: L.Control.Geocoder.nominatim({
            serviceUrl: "http://localhost/nominatim/",
            geocodingQueryParams: {
                //résultats en français
                'accept-language': map.currentLanguage,
                //on restreint les résultats sur le campus
                viewbox: [map.mapBounds.getWest(), map.mapBounds.getNorth(), map.mapBounds.getEast(), map.mapBounds.getSouth()],
                bounded: 1
            }
        }),
        waypoints: [null],
        profile: 'foot',
        language: map.currentLanguage,
        routeWhileDragging: false
    });
}

//initialise les icônes utilisées pour le plan
function instantiateIcons () {
    map.icons = {
        building: L.icon.mapkey({icon: "building", background: "black"}),
        information: L.icon.mapkey({icon: "information", background: "blue"}),
        forbidden: L.icon.mapkey({icon: "forbidden", background: "red"}),
        disabled: L.icon.mapkey({icon: "disabled", background: "darkorange"})
    };

    map.layerGroups = {
        building : new L.LayerGroup().addTo(map.leafletMap),
        information: new L.LayerGroup().addTo(map.leafletMap),
        forbidden: new L.LayerGroup().addTo(map.leafletMap),
        disabled : new L.LayerGroup().addTo(map.leafletMap)
    };
}

//initialise les icônes utilisées pour le plan
function initializeFilter () {
    if(!(map.filterControl === "")){
        map.leafletMap.removeControl(map.filterControl)
    }

    var filters = {};
    filters[map.languageStrings.filters.information[map.currentLanguage]] = map.layerGroups.information;
    filters[map.languageStrings.filters.forbidden[map.currentLanguage]] = map.layerGroups.forbidden;
    filters[map.languageStrings.filters.disabled[map.currentLanguage]] = map.layerGroups.disabled;

    map.filterControl = L.control.layers(null, filters, {position: 'bottomleft'}).addTo(map.leafletMap);
}

//fonction executée lors d'un click droit
function onMapRightClick (e) {

    //vérifie si la position du marqueur est à l'intérieur du campus
    if (e.latlng.lat < map.mapBounds.getSouth() || e.latlng.lat > map.mapBounds.getNorth() ||
        e.latlng.lng < map.mapBounds.getWest() || e.latlng.lng > map.mapBounds.getEast()) {
        return;
    }

    //stocke la position du marqueur
    map.selectedPosition = e.latlng;

    //ouvre le popup sur la position indiquée par l'utilisateur
    map.popupDom.setLatLng(e.latlng);
    $('#map-context-menu').css('display', 'block');
    map.popupDom.openOn(map.leafletMap);
}

//geolocalise l'utilisateur et place un marqueur sur sa position
function getGeolocation () {
    //détermine si le navigateur peut geolocaliser l'utilisateur
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showGeolocation, showGeolocationError, map.geoOptions);
    } else {
        Materialize.toast(map.languageStrings.error.geolocationUnavailable[map.currentLanguage], 4000);
    }
}

//si réussite de la requête de géolocalisation, affiche le résultat
function showGeolocation (position) {
    //vérifie si la position de l'utilisateur est à l'intérieur du campus
    if (position.coords.latitude < map.mapBounds.getSouth() || position.coords.latitude > map.mapBounds.getNorth() ||
        position.coords.longitude < map.mapBounds.getWest() || position.coords.longitude > map.mapBounds.getEast()) {
        Materialize.toast(map.languageStrings.error.geolocationOob[map.currentLanguage], 4000);
        return;
    }

    //vérifie s'il y a un marqueur déjà présent, si oui efface ce marqueur
    if (!(map.positionMarker === "")) {
        map.leafletMap.removeLayer(map.positionMarker);
    }

    //stocke la position du marqueur
    var currentPosition = L.latLng(position.coords.latitude, position.coords.longitude);
    //positionne le marqueur
    map.positionMarker = L.marker(currentPosition).addTo(map.leafletMap);
    map.positionMarker.bindPopup(map.languageStrings.search.geolocation[map.currentLanguage]);
    map.leafletMap.panTo(currentPosition);
    map.positionMarker.openPopup();

}

function showGeolocationError  (error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            Materialize.toast(map.languageStrings.error.geolocationDenied[map.currentLanguage], 4000);
            break;
        case error.POSITION_UNAVAILABLE:
            Materialize.toast(map.languageStrings.error.geolocationUnavailable[map.currentLanguage], 4000);
            break;
        case error.TIMEOUT:
            Materialize.toast(map.languageStrings.error.geolocationTimeout[map.currentLanguage], 4000);
            break;
        default:
            Materialize.toast(map.languageStrings.error.geolocationUnknown[map.currentLanguage], 4000);
            break;
    }
}

//prépare les données à envoyer au serveur
function prepareMarkerData() {
    //recupère la catégorie choisie
    var category = $("#add-pin-category").val();
    //recupère la limite de temps choisie
    var timelimit = $("#add-pin-timelimit").val();
    //recupère le texte écrit
    var information = $("#add-pin-information").val();

    submitMarker(map.currentCampus, map.selectedPosition.lat,
        map.selectedPosition.lng, timelimit, category, information);
}

function addMarker(marker) {
    //ajoute le marqueur sur la carte
    var position = L.latLng(marker.lat, marker.lng);

    var newMarker = L.marker(position,
        {icon: map.icons[marker.category]}
    ).addTo(map.layerGroups[marker.category]);

    //ajoute le texte au marqueur
    newMarker.bindPopup(marker.information);
}

//ajoute le contrôle de calcul de directions au plan
function startDirections(){
    //si le contrôle n'est pas sur le plan, ajoute le contrôle
    if (!(map.routingActive)) {
        map.leafletMap.removeControl(map.geocodingControl);
        map.routingControl.addTo(map.leafletMap);
        //active le bouton pour effacer le calcul de directions
        $("#btn-clear-directions").addClass("scale-in");
        //indique que le calcul de directions est en cours
        map.routingActive = true;
    }
}

//ajoute le marqueur de départ pour les directions
function directionsSetOrigin() {
    startDirections();
    map.leafletMap.closePopup();
    map.routingControl.spliceWaypoints(0, 1, map.selectedPosition);
}

//ajoute le marqueur d'arrivée pour les directions
function directionsSetDestination() {
    startDirections();
    map.leafletMap.closePopup();
    map.routingControl.spliceWaypoints(map.routingControl.getWaypoints().length - 1, 1, map.selectedPosition);
}

//enlève le contrôle de calcul de directions
function clearDirections() {
    //enlève le contrôle de calcul de directions et le remplace avec celui de recherche
    if (map.routingActive) {
        map.routingActive = false;
        map.routingControl.getPlan().setWaypoints([]);
        map.leafletMap.removeControl(map.routingControl);
        map.geocodingControl.addTo(map.leafletMap);
    }

    $("#btn-clear-directions").removeClass("scale-in");
}
