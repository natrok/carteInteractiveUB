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

$(document).ready(function () {
    loadLanguageStrings();
    $('.dropdown-button').dropdown();
    $('select').material_select();
    $('.modal').modal();
    $('#btn-directions-origin').click(directionsSetOrigin);
    $('#btn-directions-destination').click(directionsSetDestination);
    $('#cancel-add-marker').click(clearForm);
    $('#btn-confirm-marker').click(prepareMarkerData);
    $('#btn-clear-directions').click(clearDirections);
    $('#btn-campus-talence').click(function () {
        changeCampus("talence");
    });
    $('#btn-campus-carreire').click(function () {
        changeCampus("carreire");
    });
    $('#btn-language-fr').click(function () {
        changeLanguage('fr');
    });
    $('#btn-language-en').click(function () {
        changeLanguage('en');
    });
    $('#btn-language-es').click(function () {
        changeLanguage('es');
    });
});

function clearForm() {
    //effacer tout le texte du champ de texte et remet à zéro le select
    $("#add-pin-select").val('information');
    $("#add-pin-timelimit").val(2);
    $("#add-pin-information").val('');
}

function initialiseApp(){
    getNavigatorLanguage();
    $("[data-localize]").localize("/php/json/application", { language: map.currentLanguage });
    instantiateMap();
    instantiateIcons();
    initializeFilter();
    loadBounds("talence");
}
