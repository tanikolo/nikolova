$(window).on('load', function () { if ($('#preloader').length) {
  $('#preloader').delay(1000).fadeOut('slow', function () { $(this).remove();
  }); }
  });

const accessToken = 'G3JJegFVDpZS5IqVmwoXTx3Tfcm29hH2NPuFgYM94o3DTkqDuI00x3xyRf37dEjW';
const map = L.map('map', {
  center: [48.7965913, 2.3210938],
  zoom: 3,
  zoomControl: false  
});
const styles = ['jawg-terrain', 'jawg-streets', 'jawg-sunny', 'jawg-dark', 'jawg-light'];
const baselayers = {};


styles.forEach(style => {
baselayers[style] = L.tileLayer(
  `https://tile.jawg.io/${style}/{z}/{x}/{y}{r}.png?access-token=${accessToken}`, {
    attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>',
  });
});

baselayers['jawg-terrain'].addTo(map);
L.control.layers(baselayers, null, {
  position: 'bottomright' 
}).addTo(map);

L.control.zoom({
  position: 'bottomleft' 
}).addTo(map);

var currentGeoJsonLayer = null; 

function displayCountryBorders(countryCode) {
    if (currentGeoJsonLayer) {
        map.removeLayer(currentGeoJsonLayer); 
    }

    $.getJSON(`libs/php/countryBorders.geo.json`, function(data) {
        const borderFeature = data.features.find(feature => feature.properties.iso_a2 === countryCode);
        if (borderFeature) {
            currentGeoJsonLayer = L.geoJSON(borderFeature, {
                style: { color: "#ffc007", weight: 4, opacity: 0.65 }
            }).addTo(map);
            map.fitBounds(currentGeoJsonLayer.getBounds());
        } else {
            console.error("No borders found for country code:", countryCode);
        }
    }).fail(() => {
        console.error("Failed to load country borders.");
    });
}

// Populate country select
$.getJSON('libs/php/countryBorders.geo.json', function(data) {
  const countries = data.features;
  // Sort countries by name
  countries.sort((a, b) => a.properties.name.localeCompare(b.properties.name));
  
  countries.forEach(function(feature) {
      $('#selectCountry').append(`<option value="${feature.properties.iso_a2}">${feature.properties.name}</option>`);
  });
});

$('#selectCountry').change(function() {
selectedCountryCode = $(this).val();
displayCountryBorders(selectedCountryCode);
});

var selectedCountryCode = null; 

$(window).on('load', function () {
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getCountryCode(lat, lon).then(countryCode => {
          if (countryCode) {
              selectedCountryCode = countryCode; 
              displayCountryBorders(countryCode); 
          }
      });
  }, function(error) {
      console.error("Geolocation error:", error);
      alert("Geolocation error: " + error.message);
  });
} else {
  alert('Geolocation is not supported by your browser.');
}
});

function getCountryCode(lat, lon) {
  const apiKey = '65c121c9fa444dd7ae03527cd459f0be';
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;
  
  return $.getJSON(url).then(response => {
      const countryCode = response.results[0].components.country_code.toUpperCase();
      console.log('Country Code:', countryCode);
      return countryCode;
  }).catch(error => {
      console.error('Error in reverse geocoding:', error);
      return null;
  });
  }

var countryInfoDiv = $('#modalInfo');

var countryInfoModal = L.easyButton({
  position: 'bottomleft', 
states: [{
  stateName: 'show-modal',
  icon: '<i class="fas fa-info-circle text-dark"></i>',
  title: 'Country Information',
  onClick: function() {
    var countryCode = $('#countryCodeInput').val();
      showCountryInfo(countryCode);
      console.log("Country code being sent: ", countryCode);

      countryInfoDiv.modal('show');
  }
}]
}).addTo(map);

countryInfoModal.button.style.backgroundColor = '#FFC007';  

function showCountryInfo(countryCode) {
$.ajax({
    url: "libs/php/getCountryInfo.php",
    type: "GET", 
    dataType: 'json',
    data: {
        geonamesInfo: countryCode 
    },
    success: function(result) {
      if (result.status === "ok") {
        updateCountryInfo(result.data);
    } else {
        console.error('Server error: ' + result.error);
        displayError('Failed to fetch country information: ' + result.error);
    }
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.error('AJAX error: ' + textStatus + ' - ' + errorThrown);
        displayError('Error in AJAX request: ' + textStatus);
    }
});
}

function updateCountryInfo(countryInfo) {
$('#continent').html(countryInfo.continent);
$('#countryName').html(countryInfo.countryName);
$('#capital').html(countryInfo.capital);
$('#population').html(numeral(countryInfo.population).format('0,0'));
$('#languages').html(countryInfo.languages.join(', '));
$('#areaInSqKm').html(numeral(countryInfo.areaInSqKm).format('0,0') + ' km²');
$('#currency').html(countryInfo.currency);
}

function displayError(message) {
$('#errorContainer').html(message).show();
}
