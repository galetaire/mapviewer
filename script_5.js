//----------------------------------------------------------------------------------MAPA Y OPCIONES
//-------------------------------------------------------------------------------------------------
//Definimos el mapa y centramos la vista
var map = L.map('map').setView([39.5782, 2.6489], 14);

//Añadimos un control de escala al mapa 
L.control.scale({
position: 'bottomleft',
imperial: true
}).addTo(map);

//--------------------------------------------------------------------------------CAPAS GEOGRAFICAS
//-------------------------------------------------------------------------------------------------

//Definimos la url del opencycle map para luego llamarla mas facilmente
var ocmUrl = 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png';

// LLamamos al tilelayer del opencyclemap (ocm)
var ocm = L.tileLayer (ocmUrl, {
maxZoom: 18,
attribution: 'Map tiles by <a href="http://www.opencyclemap.org/">OpenCycleMap</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC-BY-3.0 </a>. Data by <a href="http://www.opencyclemap.org/">OpenCycleMap</a>,under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC-BY-SA</a>.'
 }).addTo(map);

 //Llamamos al tilelayer de openstreetmap (osm)
var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom: 18,
attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery @ <a href="http://cloudmade.com">CloudMade</a>'
});

//Llamamos a un WMS cualquiera, en este caso es un fondo con los paises
 var wms1 = L.tileLayer.wms ("http://ogc.bgs.ac.uk/cgi-bin/topography/wms?language=eng&",{
 layers: 'TOPOGRAPHY',
 format: 'image/png',
 transparent: true,
 attribution: 'Map owner <a href="http://geopole.org/map/wms/sja5gf/689049">Mr Matthew Harrison</a>, served by <a href="http://geopole.org">Geopole</a>'
 });
 
//Definimos el archivo geoJson sobre pubs, lo llamamos y le asociamos una funcion para abrir popups
var pubs = L.geoJson(pubsEstiloIrlandes, {
onEachFeature: agregarPopup
}).addTo(map);

//Definimos la funcion para agregar un popup en el archivo geoJson
function agregarPopup(feature, layer){
layer.bindPopup(("<b>Nombre:</b> " + feature.properties.nombre +
                    "<br><b>Descripción:</b> " + feature.properties.descripcion +
                    "<br><b>Rating:</b> " + feature.properties.rating));
}

//Definimos el estilo del KML que seran portales de casas aleatorios
var markerGold = L.icon({
	iconUrl: 'img/marker-gold.png', 
    iconRetinaUrl: 'my-icon@2x.png',
    iconSize: [21, 25],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
});

//Definimos la capa de portales a traves de geoJson para poder abrir popups y consultos la info
var portales = L.geoJson(null, {
pointToLayer: function (feature, latlng){
return L.marker(latlng, {icon: markerGold})
},
onEachFeature: function (feature, layer){
console.debug(feature);
layer.bindPopup(("<b>Descripción:</b> " + feature.properties.tipo_p_des +
                    "<br><b>Número Portal:</b> " + feature.properties.num_por +
                    "<br><b>Lugar:</b> " + feature.properties.fuente_des));
}
});

//Llamamos a la capa kml de portales a través de omnivore
omnivore.kml('puntos_leaflet.kml', null, portales).addTo(map);

//Definimos el control para activar/desactivar las capas que hemos cargado, definiendolas como capas base
var baseMaps = {
	"Open Cycle Map": ocm,
	"Base de OpenStreetMap": osm,
	"Fondo Paises": wms1
};
//Definimos las capas que podremos superponer a las bases
var overlays = {
"Pubs Irlandeses": pubs
};

//Añadimos estos controles de capa base y overlay al mapa
L.control.layers(baseMaps, overlays).addTo(map);

//Definimos un capa para poder dibujar encima y que guarde los elementos
var capaEdicion = new L.FeatureGroup().addTo(map);


//------------------------------------------------------------------------------------------PLUGINS
//-------------------------------------------------------------------------------------------------

// Personalizamos las opciones de plugin de drawcontrol url: https://github.com/Leaflet/Leaflet.draw
//Activamos la barra del plugin draw
map.on('draw:created', function (evento){
var layer = evento.layer;
capaEdicion.addLayer(layer);
});

//Definimos el estilo de los markers, ponemos un icono personalizado
var customMarker = L.Icon.extend({
    options: {
        shadowUrl: null,
        iconAnchor: new L.Point(12, 12),
        iconSize: new L.Point(80, 65),
        iconUrl: 'img/UNIGIS_trans.png'
    }
});

// Definimos las opciones para la toolbar que nos carga el plugin drawcontrol
var optionsDraw = {
    position: 'topleft',  //Lo colocamos a la izquierda
    draw: {
        polyline: {  //Definimos como se dibujara la linea
            shapeOptions: {
                color: '#f357a1',
                weight: 10
            }
        },
        polygon: { //Definimos como se dibujara el poligono
            allowIntersection: false, // Restringimos a solo poligonos, no pudiendo entrecruzar los vertices del mismo
            shapeOptions: {
                color: 'black'
            },
			showArea: true //Le decimos que los poligonos nos digan el area aproximada
        },
        circle: false, //Desactivamos la opcion de dibujar circulos
        rectangle: false, //Desactivamos la opcion de dibujar rectangulos
		marker: { // Definimos como seran los markers 
            icon: new customMarker() //Decimos que llame a customMarker, que es un estilo personalizado
        },
    },
    edit: {
        featureGroup: capaEdicion, //Estas objetos geometricos se guardaran en CapaEdicion
        remove: false
    }
}

//Finalmente, despues de personalizar la barra, la añadimos
var drawControl = new L.Control.Draw(optionsDraw).addTo(map);

 //Insertamos un plugin para mostrar la miniventana, url: https://github.com/Norkart/Leaflet-MiniMap
var ocm2 = new L.TileLayer(ocmUrl, {minZoom: 0, maxZoom: 15, attribution: 'OpenCycleMap'});
var miniMap = new L.Control.MiniMap(ocm2, { toggleDisplay: true }).addTo(map); 

//Insertamos un plugin para mostrar las coordenadas del raton, url:https://github.com/ardhi/Leaflet.MousePosition
L.control.mousePosition({
position: 'bottomleft',
separator: ' | '
}).addTo(map);

//Insertamos un plugin para cargar un grid, url: https://github.com/turban/Leaflet.Graticule
L.graticule({interval: 1, style:{color: '#f00', weight: 2}}).addTo(map);
