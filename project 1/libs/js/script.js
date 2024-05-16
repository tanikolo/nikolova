// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

var map; 
var countryLayer;

// tile layers

var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
  }
);

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  }
);

var basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

// buttons

var infoBtn = L.easyButton("fa-info", function (btn, map) {
  $("#modalInfo").modal("show");
});

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// Initialise and add controls once DOM is ready
  
  map = L.map("map", {
    layers: [streets]
  }).setView([54.5, -4], 6);
  

  layerControl = L.control.layers(basemaps).addTo(map);

  infoBtn.addTo(map);




// Function to populate the country select dropdown

function populateCountrySelect() {
    $.ajax({
        url: "libs/php/getCountries.php",
        type: "GET",
        dataType: "json",
        success: function(result) {
            console.log('AJAX call successful. Result:', result); 
            if (result.status.code !== 200) {
                console.log('Error reading geoJson file!');
            } else {
                result.data.forEach(data => {
                    console.log('Adding country:', data); 
                    $('#countrySelect').append("<option value=\"" + data.code + "\">" + data.name + "</option>");
                });
            }
        },
        error: function(xhr, status, error) {
            console.log('Error');
            console.log(error);
        }
    });
}


populateCountrySelect();

