var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var faultLines = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
// GET request
d3.json(url, function(data) {
    // Send data.features object to createFeatures function
    createFeatures(data.features);
  });

  function createFeatures(earthquakeData) {

    // Function to run once for each feature in features array
    // Popup describing place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"+
        "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
  
    // GeoJSON layer containing features array on earthquakeData object
    // Run onEachFeature function once for each piece of data in array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
          var color;
          var r = 250
          var g = Math.floor(250-30*feature.properties.mag);
          var b = Math.floor(250-10*feature.properties.mag);
          color= "rgb("+r+" ,"+g+","+b+")"
        
          var geojsonMarkerOptions = {
            radius: 4*feature.properties.mag,
            fillColor: color,
            color: "pink",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          };
          return L.circleMarker(latlng, geojsonMarkerOptions);
        }
      });
  
    // Sending earthquakes layer to createMap function
    createMap(earthquakes);
  }
  function createMap(earthquakes) {
    // Map Layers
    var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiY2ZlcnJhcmVuIiwiYSI6ImNqaHhvcW9sNjBlMmwzcHBkYzk0YXRsZ2cifQ.lzNNrQqp-E85khEiWhgq4Q");
    var grayScale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiY2ZlcnJhcmVuIiwiYSI6ImNqaHhvcW9sNjBlMmwzcHBkYzk0YXRsZ2cifQ.lzNNrQqp-E85khEiWhgq4Q");
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiY2ZlcnJhcmVuIiwiYSI6ImNqaHhvcW9sNjBlMmwzcHBkYzk0YXRsZ2cifQ.lzNNrQqp-E85khEiWhgq4Q");
  
  
    // Selectable basemaps
    var baseMaps = {
      "Satellite Map": satelliteMap,
      "Outdoor Map": outdoors,
      "Gray Scale": grayScale
    };
  
    // Tectonic plate layer
    var faultLines =new  L.LayerGroup();
  
    // Overlay object to hold overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes,
      Faultlines: faultLines
    };
  
    // Create map
    var myMap = L.map("map", {
      center: [41.881832, -87.62317],
      zoom: 2.5,
      layers: [satelliteMap, grayScale, outdoors]
    
    });
  
     // Fault lines data
     d3.json(faultLines, function(earthquakeData) {
       // Adding geoJSON data to  tectonic plates
       L.geoJson(earthquakeData, {
         color: "orange",
         weight: 3
       })
       .addTo(faultLines);
     });
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
    legend: true
  }).addTo(myMap);
  
  var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Categories</strong>'],
    categories = ['Road Surface','Signage','Line Markings','Roadside Hazards','Other'];

    for (var i = 0; i < categories.length; i++) {

            div.innerHTML += 
            labels.push(
                '<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' +
            (categories[i] ? categories[i] : '+'));

        }
        div.innerHTML = labels.join('<br>');
    return div;
    };
    legend.addTo(myMap);
  }