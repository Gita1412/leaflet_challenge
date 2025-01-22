// API endpoint for earthquake data
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch the data using D3
d3.json(queryUrl).then(function (data) {
    createFeatures(data.features);
});

// Create Features for Earthquake Data
function createFeatures(earthquakeData) {
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            let magnitude = feature.properties.mag;
            let depth = feature.geometry.coordinates[2];
            let color = getColor(depth);

            return L.circleMarker(latlng, {
                radius: magnitude * 4, // Scaled for visibility
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

    createMap(earthquakes);
}

// Create the Map
function createMap(earthquakes) {
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
    });

    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    let overlayMaps = {
        "Earthquakes": earthquakes
    };

    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [street, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

    // Add a legend to the map
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [0, 10, 30, 50, 70, 90];
        let labels = [];

        // Loop through depth intervals and create legend items
        for (let i = 0; i < depths.length; i++) {
            let from = depths[i];
            let to = depths[i + 1];
            let color = getColor(from + 1); // Match with getColor logic

            labels.push(
                `<i style="background:${color}"></i> ${from}${to ? `&ndash;${to} km` : '+ km'}`
            );
        }

        // Add the legend items to the div
        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(myMap);
}

// Function to determine marker color based on depth
function getColor(depth) {
    return depth > 90 ? '#990000' :  // Deep red
           depth > 70 ? '#d7301f' :  // Dark red
           depth > 50 ? '#fc4e2a' :  // Red-orange
           depth > 30 ? '#008000' :  // Green
           depth > 10 ? '#32CD32' :  // Lime green
                        '#90EE90';   // Light green
}
