// Tile layer as background
let usaMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

//Initialize layers
let layers = {
    Earthquakes: new L.LayerGroup()
};

// Create map with earthquake layer
let map = L.map("map", {
    center: [37.0902, -95.7129],
    zoom: 5,
    layers: [layers.Earthquakes]

});

// add usa map tile layer to map
usaMap.addTo(map);

// establish overlays to add to layer control
let overlays = {
    "Earthquakes": layers.Earthquakes,
};

// establish control for layers 
L.control.layers(null, overlays).addTo(map);


// Define color scale based on depth
const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
    .domain([90,0]); // Define the depth range for the color scale

// Create legend
let legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    //const grades = [0, 2, 4, 6, 8, 10, 12, 14, 16]; // Define magnitude grades
    const grades = [-10, 10, 30, 50, 70, 90];
    let labels = [];

    // Loop through depth grades and add colors to legend
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML += '<li style="background:' + colorScale(grades[i]) + '"> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1]   : '+') + '</li>';
    }
    return div;
};

// Adding the legend to the map
legend.addTo(map);

//API calls for Earthquake information

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(weekData) {
    weekData.features.forEach(function(feature) {
        const coordinates = feature.geometry.coordinates;
        const depth = coordinates[2];
        const magnitude = feature.properties.mag;

        const markerSize = magnitude * 3; 
        let markerColor = colorScale(depth);

        L.circleMarker([coordinates[1], coordinates[0]], {
            radius: markerSize,
            color: 'green',
            fillColor: markerColor,
            fillOpacity: 0.7,
            weight: 1
        }).addTo(map).bindPopup(`Location: ${feature.properties.place}<br>Magnitude: ${magnitude}<br> Depth: ${depth}`);
    });
});

