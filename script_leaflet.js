var map = L.map('map').setView([41.39742, 2.16328], 13);

map.on('draw:created', function (evento){
var layer = evento.layer;
capaEdicion.addLayer(layer);
});

var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom: 18,
attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery @ <a href="http://cloudmade.com">CloudMade</a>'
}).addTo(map);

var paint = L.tileLayer ('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
maxZoom: 18,
attribution: 'Map tiles by <a href="http://stamen.com">Stamen Desgn</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC-BY-3.0 </a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>,under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC-BY-SA</a>.'
 });
 
 var icc = L.tileLayer.wms ("http://geoserveis.icc.cat/icc_mapesbase/wms/service?",{
 layers: 'mtc25m',
 format: 'image/png',
 transparent: true,
 attribution: "Institut Cartogràfic i Geològic de Catalunya"
 });

var parques = L.geoJson(parquesjson, {
onEachFeature: agregarPopup
}).addTo(map);

var estiloCirculos = {
radius: 8,
fillColor: "#ff7800",
color: "#000",
weight:1,
opacity:1,
fillOpacity:0.8
};

var bibliotecas = L.geoJson(null, {
pointToLayer: function (feature, latlng){
return L.circleMarker(latlng, estiloCirculos);
}
});

omnivore.kml('img/bibliotecas.kml', null, bibliotecas).addTo(map);

var capaEdicion = new L.FeatureGroup().addTo(map);

L.control.scale({
position: 'topright',
imperial: true
}).addTo(map);

var baseMaps = {
	"Base de OpenStreetMap": osm,
	"fdfg": icc,
	"Acuarela": paint
};

var overlays = {
"Topo ICGC": icc,
"Parques": parques
};

L.control.layers(baseMaps, overlays).addTo(map);

var drawControl = new L.Control.Draw({
edit: {
featureGroup: capaEdicion
}
}).addTo(map);

function agregarPopup(feature, layer){
layer.bindPopup(feature.properties.nombre);
}