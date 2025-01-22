let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

Promise.all([d3.json(earthquakeUrl), d3.json(platesUrl)])
  .then(function ([earthquakeData, platesData]) {
    console.log("Earthquake data:", earthquakeData);
    console.log("Tectonic plates data:", platesData);
    createFeatures(earthquakeData.features, platesData);
  })
  .catch(function (error) {
    console.error("Error fetching data:", error);
    alert("Failed to load earthquake or tectonic plates data. Please refresh the page.");
  });

function createFeatures(earthquakeData, platesData) {
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`Location: ${feature.properties.place}<br>Time: ${new Date(feature.properties.time)}`);
    },
    pointToLayer: function (feature, latlng) {
      let magnitude = feature.properties.mag;
      let depth = feature.geometry.coordinates[2];
      return L.circleMarker(latlng, {
        radius: magnitude * 4,
        fillColor: getColor(depth),
        color: "black",
        weight: 1,
        fillOpacity: 0.8
      });
    }
  });

  let tectonicPlates = L.geoJSON(platesData, {
    style: {
      color: "orange",
      weight: 2
    }
  });

  createMap(earthquakes, tectonicPlates);
}

function createMap(earthquakes, tectonicPlates) {
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
  });

  let satellite = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri'
  });

  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "Satellite Map": satellite
  };

  let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ["#1E90FF", "#90EE90", "#32CD32", "#008000", "#fc4e2a", "#d7301f", "#990000"];

    div.innerHTML = "<h4>Depth (km)</h4>";
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        `<i style="background: ${colors[i]}"></i> ` +
        `${depths[i]}${depths[i + 1] ? `&ndash;${depths[i + 1]}` : "+"}<br>`;
    }
    return div;
  };

  legend.addTo(myMap);
}

function getColor(depth) {
  return depth > 90 ? "#990000" :
         depth > 70 ? "#d7301f" :
         depth > 50 ? "#fc4e2a" :
         depth > 30 ? "#008000" :
         depth > 10 ? "#32CD32" :
         depth > -10 ? "#90EE90" :
                      "#1E90FF";
}
