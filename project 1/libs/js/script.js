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


//Adding borders to the map

var countryLayerGroup = L.featureGroup().addTo(map);

$(window).on('load', function () {
    if ($('#preloader').length) {
        $('#preloader').delay(1000).fadeOut('slow', function () { 
        $(this).remove();
        }); 
    }
});

// Function to populate the country select dropdown

function populateCountrySelect() {
    $.ajax({
        url: 'libs/php/getCountryData.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status.code === 200) {
                let countries = response.data;
                let countrySelect = $('#countrySelect');
                countrySelect.empty();
                countries.forEach(function(country) {
                    countrySelect.append(new Option(country.name, country.iso2));
                });

                countrySelect.change(function() {
                    const selectedCountryCode = $(this).val();
                    showCountryBorders(selectedCountryCode);
                    showCountryInfo(selectedCountryCode);
                });
            } else {
                console.error('Error loading country list:', response.status.description);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Failed to retrieve country list:', textStatus, errorThrown);
        }
    });
}

// Function to show country borders
function showCountryBorders(countryCode) {
    $.ajax({
        url: 'libs/php/getCountryBorders.php',
        type: 'GET',
        data: { iso2: countryCode },
        dataType: 'json',
        success: function(response) {
            if (response.status.code === 200) {
                countryLayerGroup.clearLayers();
                L.geoJSON(response.data, {
                    style: { fillColor: "grey", weight: 2, opacity: 1, color: "black", fillOpacity: 0.3 }
                }).addTo(countryLayerGroup);
                map.fitBounds(countryLayerGroup.getBounds());
            } else {
                console.error('Error retrieving country borders:', response.status.description);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Failed to retrieve country borders:', textStatus, errorThrown);
        }
    });
}

// Fetching current user's location using JS navigator and OpenCage API

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        $.ajax({
            url: 'libs/php/getCountryCode.php',
            type: 'GET',
            data: {
                lat: lat,
                lon: lon
            },
            dataType: 'json',
            success: function(response) {
                if (response.status.code === 200) {
                    let countryCode = response.data.countryCode;
                    console.log('Detected country code:', countryCode);
                    $('#countrySelect').val(countryCode);
                    showCountryBorders(countryCode);
                } else {
                    console.error('Error retrieving country code:', response.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Failed to retrieve country code:', textStatus, errorThrown);
            }
        });
    }, function(error) {
        console.error('Geolocation error:', error);
    });
} else {
    console.error('Geolocation is not supported by this browser.');
}

populateCountrySelect();

// Function to show country info in a modal

function showCountryInfo(countryCode) {
    console.log(countryCode);
    $.ajax({
        url: 'libs/php/getCountryInfo.php',
        type: 'GET',
        dataType: 'json',
        data: { country: countryCode },
        success: function(result) {
            console.log(JSON.stringify(result));

            if (result.status.code === 200) {
                const country = result.data[0];

                $('#country').text(country.countryName);
                $('#capital').text(country.capital);
                $('#continent').text(country.continentName);
                $('#population').text(country.population);
                $('#languages').text(country.languages);
                $('#currency').text(country.currencyCode);
                $('#area').text(country.areaInSqKm + " sq km");

                $('#modalInfo').modal('show');
            } else {
                console.error("Error loading country data:", result.status.description);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('AJAX error:', textStatus, errorThrown);
        }
    });
}
