# Carte Interactive Université de Bordeaux

Plan en ligne du campus de Talence avec recherche, calcul de directions, et collaboration en ligne avec des marqueurs.

Possibilité d'extension avec de nouveaux marqueurs et campus.

## Description de l'hiérarchie de fichiers

Le dossier src contient l'intégralité des sources des librairies utilisées.

Le dossier database content le fichier sql qui est nécessaire pour créer la table pour stocker les marqueurs.

Le dossier html contient l'application web. C'est ce dossier qui contient le fichier index.html qu'il faut servir à l'utilisateur.

Le dossier html est structuré dans des sous-dossiers css, fonts, images, js et php. 
Le code qui a été produit pour ce projet est contenu dans la racine du dossier js (main.js, map.js, server.js) et dans le dossier php.
Certaines modifications ont été apportées aux fichiers css des librairies utilisées pour éviter les conflits.

### Prérequis

Accès à un serveur de tuilage pour l'affichage du plan (par défaut une clé publique pour le service Mapbox est fournie).

Mise en place d'un serveur OSRM (Open Source Routing Machine) pour le calcul de directions.

Mise en place d'une base de données Nominatim pour la recherche.

## Installation

###Télechargement du fichier osm

Un fichier osm qui contient toutes les données géographiques de la zone est requis pour le fonctionnement du site.

Ce fichier peut être téléchargé depuis le site de [OpenStreetMap](https://www.openstreetmap.org/export) directement ou depuis [Geofabrik](http://download.geofabrik.de/).
Le fichier Geofabrik de la région d'Aquitaine est celui qui a été utilisé pour le développement de l'application.

###Installation du serveur OSRM

Veuillez suivre les instructions fournies sur le [depôt de OSRM](https://github.com/Project-OSRM/osrm-backend/wiki) pour mettre en place le serveur OSRM.
 
L'application a été conçue pour utiliser le profil "foot", afin de fournir des instructions pour le déplacement à pied.
  
Le port 5000 de localhost est utilisé par défaut par le serveur quand il est mis en route.
Si cet(te) port/adresse ne convient pas et a été changé(e), il est nécessaire de le préciser ligne 79 du fichier map.js.

```
function instantiateDirections () {
    map.routingControl = L.Routing.control({
        serviceUrl: 'http://localhost:5000/route/v1',
```

### Installation du serveur Nominatim

Veuillez suivre les instructions fournies sur le [depôt de Nominatim](https://github.com/openstreetmap/Nominatim/blob/master/docs/Installation.md) pour mettre en place le serveur Nominatim.
 
L'application nécessite l'addition des informations des POI (points d'intérêt) décrite dans la section "Loading additionl datasets" pour que la recherche de bâtiments puisse se faire.

````
./utils/specialphrases.php --wiki-import > specialphrases.sql
psql -d nominatim -f specialphrases.sql
````

N'exécutez ces commandes que quand le tutoriel d'installation vous l'indique!
  
L'addresse http://localhost/nominatim/ est celle qui est utilisée par défaut lors du tutoriel. 
Si cette adresse ne convenait pas et a été changée, il est nécessaire de le préciser lignes 58 et 81 du fichier map.js.

````
function instantiateSearch() {
    map.geocodingControl = L.Control.geocoder({
        geocoder: L.Control.Geocoder.nominatim({
            serviceUrl: "http://localhost/nominatim/",
````

```
function instantiateDirections () {
    map.routingControl = L.Routing.control({
        serviceUrl: 'http://localhost:5000/route/v1',
        geocoder: L.Control.Geocoder.nominatim({
            serviceUrl: "http://localhost/nominatim/",
```

### Création de la table markers dans la base de données

Le fichier database.sql contient une requête postgresql qui crée la table nécessaire pour le stockage des marqueurs.

Le fichier conntect.php dans le dossier php contient les informations de connexion à la base de données (nom de la base, addresse, utilisateur, mot de passe).
Veuillez changer ces données selon besoin.

###Lancement de l'application

Il suffit de servir le dossier html, avec index.html comme fichier d'index, dans le serveur de votre choix.

Le tutoriel d'installation de Nominatim utilise un serveur apache.
C'est ce serveur qui a aussi été utilisé pour le développement de l'application.
Veuillez démarrer préalablement le services osrm, nominatim, et psql pour assurer le fonctionnement de l'application. 

## Possibilité d'extension des fonctionnalités de l'application

###Ajout de nouveaux campus

L'ajout de nouveaux campus se fait aisément grâce au fichier bounds.json contenu dans html/php/json/bounds.json

Ce fichier contient les limites géographiques de chaque campus. Vous pouvez y ajouter de nouveaux campus à condition que
ces campus soient présents dans le fichier osm téléchargé au début du processus d'installation. 

Si ce n'est pas le cas, il sera nécessaire de regénérer les fichiers osrm et de mettre à jour le service nominatim 
(les instructions pour la mise à jour du service nominatim sont fournies sur le tutoriel d'installation)

Ajoutez un nouveau campus dans bounds.json selon le format suivant:
```
  "nom_campus": {
    "maxLat": latitude_max,
    "maxLng": longitude_max,
    "minLat": latitude_min,
    "minLng": longitude_min
  },
```

Ajoutez dans index.html (ligne 51) un nouveau bouton pour le campus :
 
 ```
<ul id="campusDropdown" class="dropdown-content">
    <li><a id="btn-campus-nom_campus" href="#">Nom Campus</a></li>
 ```
 
Ajoutez sur main.js (ligne 11) la fonction qui sera lancée par ce lien : 
  ```
    $('#btn-campus-nom_campus').click(function () {
        changeCampus("nom_campus");
    });
  ```
  
Ajoutez ce campus dans le Set campusSet défini dans map.js (ligne 5) pour la validation côté client :
  
  ```
    campusSet: new Set(["talence", "carreire", "campus_name"]),
  ```
  
Ajoutez ce campus sur le tableau campusArray défini dans connect.php pour la validation côté serveur:

  ```
    $campusArray = array("talence", "carreire", "campus_name");
  ```

###Ajout de nouvelles langues

L'ajout de nouvelles langues se fait grâce aux fichiers json contenus dans php/json

Veuillez créer un fichier application-xx.json, ou xx est le code de la langue souhaitée, selon les modèles déjà présents pour traduire le site web vers cette nouvelle langue.

Vous devez aussi étendre le fichier javaScriptStrings.json avec un nouveau string pour chaque élément présent pour traduire tout le texte qui ne n'est pas lié au fichier html. 

Enfin, vous devez étendre le code à trois endroits:

Ajoutez un bouton pour la nouvelle langue ligne dans index.html ligne 44 :
```
    <ul id="languageDropdown" class="dropdown-content">
        <li><a id="btn-language-fr" href="#" data-localize="french">Français</a></li>
        <li><a id="btn-language-en" href="#" data-localize="english">Anglais</a></li>
        <li><a id="btn-language-es" href="#" data-localize="spanish">Espagnol</a></li>
    </ul>
```

Ajoutez la fonction javascript à lancer lors de l'appui de ce bouton dans main.js ligne 17:
```
    $('#btn-language-fr').click(function () {
        changeLanguage('fr');
    });
```

Dans la fonction getNavigatorLanguage de server.js ligne 149, ajoutez un nouveau élément au switch case pour ajouter la langue à la liste de langues prise en compte:

```
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
```

###Ajout de nouveaux marqueurs

L'ajout de nouveaux marqueurs est possible pour étendre le type d'informations que les utilisateurs peuvent ajouter.


Ajoutez une nouvelle icône de n'importe quel type dans map.icons (map.js ligne 99) (mapkeyicons est utilisé par défaut):
```
    map.icons = {
        building: L.icon.mapkey({icon: "building", background: "black"}),
        information: L.icon.mapkey({icon: "information", background: "blue"}),
        forbidden: L.icon.mapkey({icon: "forbidden", background: "red"}),
        disabled: L.icon.mapkey({icon: "disabled", background: "darkorange"})
    };
```

Ajoutez un nouveau layerGroup pour cette nouvelle icône dans map.layerGroups (map.js ligne 106):
```
    map.layerGroups = {
        building : new L.LayerGroup().addTo(map.leafletMap),
        information: new L.LayerGroup().addTo(map.leafletMap),
        forbidden: new L.LayerGroup().addTo(map.leafletMap),
        disabled : new L.LayerGroup().addTo(map.leafletMap)
    };
```

Ajoutez un nouveau filtre dans la fonction initializeFilter de map.js ligne 120:
 
 ```
    filters[map.languageStrings.filters.information[map.currentLanguage]] = map.layerGroups.information;
    filters[map.languageStrings.filters.forbidden[map.currentLanguage]] = map.layerGroups.forbidden;
    filters[map.languageStrings.filters.disabled[map.currentLanguage]] = map.layerGroups.disabled;
 ```
 
 Ce nouveau filtre nécessite que le nom du filtre ait été ajouté préalablement dans javascriptStrings.json.
 
Ajoutez cette icône dans le Set categorySet défini dans map.js (ligne 9) pour la validation côté client :
```
    categorySet: new Set(["information", "forbidden", "disabled"]),
```
  
Ajoutez ce campus sur le tableau categoryArray défini dans connect.php pour la validation côté serveur:

```
   $categoryArray = array("information", "forbidden", "disabled");
```

 ###Ajout de nouveaux bâtiments (preuve de concept)
 
 Le fichier buildings.json dans php/json contient la structure nécessaire pour ajouter les informations sur les bâtiments au plan.
 Tous les bâtiments d'un campus sont ajoutés au plan avec l'icône "building". 
 
 Cette syntaxe permet aussi d'ajouter des marqueurs permanents de n'importe quel type, en changeant la catégorie d'un marqueur.

## Autheurs

* **Shervin Sarain**
* **Anne Gning** 
* **Diego Alexander Ramirez** 
* **Lydia Zekrini** 