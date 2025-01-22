// Earthquake API
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Tectonic plates URLs
let boundariesUrl = "static/GeoJSON/PB2002_boundaries.json";
let orogensUrl = "static/GeoJSON/PB2002_orogens.json";
let platesUrl = "static/GeoJSON/PB2002_plates.json";
let stepsUrl = "static/GeoJSON/PB2002_steps.json";

// Base layers
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
});
let satellite = L.tileLayer('https://{s}.satellite.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
});

// Initialize overlays
let overlays = {};

// Create the map
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street]
});

// Load earthquake data
d3.json(queryUrl).then(function (data) {
    let earthquakes = L.geoJSON(data.features, {
        pointToLayer: function (feature, latlng) {
            let magnitude = feature.properties.mag;
            let depth = feature.geometry.coordinates[2];
            let color = getColor(depth);

            return L.circleMarker(latlng, {
                radius: magnitude * 4,
                fillColor: color,
                color: color,
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup(`
                <h3>${feature.properties.place}</h3>
                <hr>
                <p><strong>Magnitude:</strong> ${magnitude}<br>
                <strong>Depth:</strong> ${depth} km<br>
                <strong>Time:</strong> ${new Date(feature.properties.time)}</p>
            `);
        }
    });
    overlays["Earthquakes"] = earthquakes;
    earthquakes.addTo(myMap);
});

// Load tectonic plates data
Promise.all([
    d3.json(boundariesUrl),
    d3.json(orogensUrl),
    d3.json(platesUrl),
    d3.json(stepsUrl)
]).then(function ([boundariesData, orogensData, platesData, stepsData]) {
    let boundariesLayer = L.geoJSON(boundariesData, { style: { color: "red", weight: 2 } });
    let orogensLayer = L.geoJSON(orogensData, { style: { color: "green", weight: 2, fillOpacity: 0.4 } });
    let platesLayer = L.geoJSON(platesData, { style: { color: "blue", weight: 1 } });
    let stepsLayer = L.geoJSON(stepsData, { style: { color: "purple", weight: 1 } });

    overlays["Plate Boundaries"] = boundariesLayer;
    overlays["Orogens"] = orogensLayer;
    overlays["Tectonic Plates"] = platesLayer;
    overlays["Boundary Steps"] = stepsLayer;

    boundariesLayer.addTo(myMap); // Optional: Add layers to the map by default
});

// Add layer control
L.control.layers({
    "Street": street,
    "Satellite": satellite
}, overlays, { collapsed: false }).addTo(myMap);

// Legend
L.control({ position: "bottomright" }).onAdd = function () {
    let div = L.DomUtil.create("div", "legend");
    div.innerHTML = "<h4>Depth Legend</h4>";
    return div;
}.addTo(myMap);

// Color function
function getColor(depth) {
    return depth > 90 ? "#990000" :
           depth > 70 ? "#d7301f" :
           depth > 50 ? "#fc4e2a" :
           depth > 30 ? "#008000" :
           depth > 10 ? "#32CD32" :
                        "#90EE90";
}