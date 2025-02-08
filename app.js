var map = L.map('map').setView([52.23, 21.02], 11);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var customIcon = L.icon({
    iconUrl: 'leaflet/images/energy.png',
    iconSize: [32, 32], 
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});


function popUp(f, l) {
    var out = [];
    if (f.properties) {

        if (f.properties["@id"]) {
            out.push("Id: " + f.properties["@id"]);
        }

        if (f.properties["name"]) {
            out.push("Nazwa: " + f.properties["name"]);
        }

        if (f.properties["operator"]) {
            out.push("Operator: " + f.properties["operator"]);
        }

        if (f.properties["capacity"]) {
            out.push("Ilość miejsc do ładowania: " + f.properties["capacity"]);
        }

        if (out.length > 0) {
            l.bindPopup(out.join("<br />"));
        }
    }
}


// add geojson to map
var geojsonLayer = new L.GeoJSON.AJAX("punkty_ladowania.geojson", {
    onEachFeature: popUp,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: customIcon });
    }
}).addTo(map);

var drogiGlowneLayer = L.geoJSON(drogiGlowne, {
    style: function (feature) {
        return {
            color: "darkred",
            weight: 1.5,
            opacity: 1
        };
    }
}).addTo(map);

var granicaLayer = L.geoJSON(granica, {
    style: function (feature) {
        return {
            color: "black",
            weight: 2,
            opacity: 1,
            fillColor: "gray",
            fillOpacity: 0.15
        };
    }
}).addTo(map);

// Heatmap
var heatData = [];

geojsonLayer.on("data:loaded", function () {
    geojsonLayer.eachLayer(function (layer) {
        var coordinates = layer.feature.geometry.coordinates;
        var latlng = L.latLng(coordinates[1], coordinates[0]);
    
        var capacity = layer.feature.properties["capacity"] ? parseInt(layer.feature.properties["capacity"]) : 1;
        console.log(capacity);
    
        var weight = (capacity/14)*5
        heatData.push([latlng.lat, latlng.lng, weight]);
    });

    var heatLayer = L.heatLayer(heatData, {
        radius: 30,    
        blur: 30,    
        maxZoom: 7,   
        gradient: {    
            0.3: 'red',
            0.5: 'orange',
            0.65: 'yellow',
            0.8: 'lime',
            1.0: 'blue'
        }
        
    }).addTo(map);

    var baseLayers = {
        "OpenStreetMap": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        })
    };

    var overlays = {
        "Punkty ładowania samochodu": geojsonLayer,
        "Drogi główne": drogiGlowneLayer,
        "Granica": granicaLayer,
        "Rozkład punktów ładowania": heatLayer
    };

    L.control.layers(baseLayers, overlays).addTo(map); 
});


