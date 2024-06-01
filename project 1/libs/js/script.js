
let map;
let currentGeoJsonLayer = null; 
let countryBorders = null;
let detectedCountryCode = null; 
let detectedCountryName = null; 
let capitalMarker = null; 
let detectedLat = null; 
let detectedLon = null; 
let capitalName = null; 

const airportIcon = L.ExtraMarkers.icon({
    icon: 'fa-solid fa-plane',
    markerColor: 'blue',
    shape: 'circle',
    prefix: 'fa'
});
const parkIcon = L.ExtraMarkers.icon({
    icon: 'fa-solid fa-tree',
    markerColor: 'green',
    shape: 'circle',
    prefix: 'fa'
});
const stadiumIcon = L.ExtraMarkers.icon({
    icon: 'fa-regular fa-futbol',
    markerColor: 'orange',
    shape: 'circle',
    prefix: 'fa'
});
const museumIcon = L.ExtraMarkers.icon({
    icon: 'fa-solid fa-landmark',
    markerColor: 'purple',
    shape: 'circle',
    prefix: 'fa'
});
const hotelIcon = L.ExtraMarkers.icon({
    icon: 'fa-solid fa-square-h',
    markerColor: 'yellow',
    shape: 'circle',
    prefix: 'fa'
});

const airportsCG = L.markerClusterGroup({
    polygonOptions: {
        fillColor: "#0074D9",
        color: "#001f3f",
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.5
    }
});

const parksCG = L.markerClusterGroup({
    polygonOptions: {
        fillColor: "#2ECC40",
        color: "#0D632D",
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.5
    }
});

const stadiumsCG = L.markerClusterGroup({
    polygonOptions: {
        fillColor: "#FF851B",
        color: "#B34700",
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.5
    }
});

const museumsCG = L.markerClusterGroup({
    polygonOptions: {
        fillColor: "#B10DC9",
        color: "#5A005A",
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.5
    }
});

const hotelsCG = L.markerClusterGroup({
    polygonOptions: {
        fillColor: "#FFDC00",
        color: "#B8860B",
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.5
    }
});

const overlays = {
    Airports: airportsCG,
    Parks: parksCG,
    Stadiums: stadiumsCG,
    Museums: museumsCG,
    Hotels: hotelsCG
};

function initializeMap(accessToken) {
    map = L.map('map', {
        center: [48.7965913, 2.3210938],
        zoom: 3,
        zoomControl: false
    });

    const styles = {
        'jawg-terrain': 'Terrain',
        'jawg-sunny': 'Sunny',
        'jawg-dark': 'Dark',
        'jawg-light': 'Light'
    };

    const baselayers = {};

    for (const [style, displayName] of Object.entries(styles)) {
        baselayers[displayName] = L.tileLayer(
            `https://tile.jawg.io/${style}/{z}/{x}/{y}{r}.png?access-token=${accessToken}`, {
                attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>',
            });
    }

    baselayers['Terrain'].addTo(map);

    L.control.layers(baselayers, null, {
        position: 'topright'
    }).addTo(map);

    L.control.zoom({
        position: 'topleft'
    }).addTo(map);

    const infoBtn = L.easyButton({
        position: 'topleft',
        states: [{
            stateName: 'show-info-modal',
            icon: '<i class="fas fa-info-circle fa-responsive text-dark"></i>',
            title: 'Country Information',
            onClick: function () {
                const countryCode = $('#countrySelect').val() || detectedCountryCode; 
                showCountryInfo(countryCode);
                console.log("Country code being sent: ", countryCode);
                $('#modalInfo').modal('show');
            }
        }]
    }).addTo(map);

    const wikiBtn = L.easyButton({
        position: 'topleft',
        states: [{
            stateName: 'show-wiki-modal',
            icon: '<i class="fab fa-wikipedia-w fa-responsive text-dark"></i>',
            title: 'Wikipedia Information',
            onClick: function () {
                const countryName = $('#countrySelect option:selected').text() !== "Select country..." ? $('#countrySelect option:selected').text() : detectedCountryName; 
                const countryCode = $('#countrySelect').val() || detectedCountryCode; 
                fetchWikipediaSummary(countryName, countryCode);
                console.log("Country name being sent: ", countryName);
                $('#wikiModal').modal('show');
            }
        }]
    }).addTo(map);

    const weatherBtn = L.easyButton({
        position: 'topleft',
        states: [{
            stateName: 'show-weather-modal',
            icon: '<i class="fas fa-cloud-sun fa-responsive text-dark"></i>',
            title: 'Weather Information',
            onClick: function () {
                const countryCode = $('#countrySelect').val() || detectedCountryCode;
                if (countryCode === detectedCountryCode) { 
                    fetchWeatherData(detectedLat, detectedLon, detectedCountryCode);
                } else {  
                    $.ajax({
                        url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
                        type: 'GET',
                        dataType: 'json',
                        success: function (result) {
                            if (result && result.length > 0) {
                                const countryInfo = result[0];
                                const lat = countryInfo.latlng[0];
                                const lon = countryInfo.latlng[1];
                                capitalName = countryInfo.capital ? countryInfo.capital[0] : 'Unknown'; 
                                fetchWeatherData(lat, lon, countryCode);
                            } else {
                                console.error('No data found for country code:', countryCode);
                            }
                        },
                        error: function (xhr, status, error) {
                            console.log('Error fetching country info:', error);
                        }
                    });
                }
                $('#modalWeather').modal('show');
            }
        }]
    }).addTo(map);

    const currencyBtn = L.easyButton({
        position: 'topleft',
        states: [{
            stateName: 'show-currency-modal',
            icon: '<i class="fab fa-dollar-sign fa-responsive text-dark"></i>',
            title: 'Currency Converter',
            onClick: function () {
                $('#currencyModal').modal('show'); 
            }
        }]
    }).addTo(map);

    const newsBtn = L.easyButton({
        position: 'topleft',
        states: [{
            stateName: 'show-news-modal',
            icon: '<i class="fas fa-rss fa-responsive text-dark"></i>',
            title: 'Latest News',
            onClick: function () {
                const countryCode = $('#countrySelect').val() || detectedCountryCode; 
                const capitalCity = capitalName || 'news'; 
                console.log("Country code being sent: ", countryCode);
                console.log("Capital city being sent: ", capitalCity);
                $('#newsModal').modal('show');
                fetchLatestNews(countryCode, capitalCity);
            }
        }]
    }).addTo(map);
  
    const aboutBtn = L.easyButton({
        position: 'topleft',
        states: [{
            stateName: 'show-about-modal',
            icon: '<i class="fa-regular fa-circle-question fa-responsive text-dark"></i>',
            title: 'About Gazetteer',
            onClick: function () {
                $('#aboutModal').modal('show');
            }
        }]
    }).addTo(map);

	infoBtn.button.style.backgroundColor = '#D2DE32';
	wikiBtn.button.style.backgroundColor = '#D2DE32';
	weatherBtn.button.style.backgroundColor = '#D2DE32';
	currencyBtn.button.style.backgroundColor = '#D2DE32';
	newsBtn.button.style.backgroundColor = '#D2DE32';
  	aboutBtn.button.style.backgroundColor = '#D2DE32';
  

    map.addLayer(airportsCG);
    map.addLayer(parksCG);
    map.addLayer(stadiumsCG);
    map.addLayer(museumsCG);
    map.addLayer(hotelsCG);
    loadCountryBorders();
    populateCountrySelect();
    detectUserCountry();
}

$.ajax({
    url: 'libs/php/getMapToken.php',
    type: 'GET',
    dataType: 'json',
    success: function (data) {
        if (data.token) {
            const accessToken = data.token;
            initializeMap(accessToken);
        } else {
            console.error('Failed to retrieve access token');
        }
    },
    error: function (xhr, status, error) {
        console.error('Error fetching access token:', error);
    }
});

function loadCountryBorders() {
    $.ajax({
        url: 'libs/php/getCountryBorders.php',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            countryBorders = data;
            console.log('Country borders loaded:', countryBorders); 
        },
        error: function (xhr, status, error) {
            console.log('Error loading country borders:', error);
        }
    });
}

function detectUserCountry() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            detectedLat = lat;
            detectedLon = lon;
            $.ajax({
                url: 'libs/php/getUserCountry.php',
                type: 'GET',
                dataType: 'json',
                data: {
                    lat: lat,
                    lon: lon
                },
                success: function (data) {
                    detectedCountryCode = data.country_code.toUpperCase(); 
                    detectedCountryName = data.country_name; 
                    console.log('Detected country code:', detectedCountryCode);
                    console.log('Detected country name:', detectedCountryName);
                    displayCountryBorders(detectedCountryCode);
                    fetchCountryInfo(detectedCountryCode, lat, lon); 
                    fetchCountryAirports(detectedCountryCode);
                    fetchCountryParks(detectedCountryCode);
                    fetchCountryStadiums(detectedCountryCode);
                    fetchCountryMuseums(detectedCountryCode);
                    fetchCountryHotels(detectedCountryCode);
                },
                error: function (xhr, status, error) {
                    console.log('Error detecting user country:', error);
                }
            });
        }, function (error) {
            console.log('Error in geolocation:', error);
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function displayCountryBorders(countryCode) {
    console.log("Display country borders for code:", countryCode);
    if (!countryCode) {
        console.error("Country code is undefined");
        return;
    }
    if (!countryBorders) {
        console.error("Country borders data not loaded");
        return;
    }
    if (currentGeoJsonLayer) {
        map.removeLayer(currentGeoJsonLayer);
    }
    const borderFeature = countryBorders.features.find(feature => feature.properties.iso_a2 === countryCode);
    if (borderFeature) {
        currentGeoJsonLayer = L.geoJSON(borderFeature, {
            style: {
                color: "#0E46A3",
                weight: 4,
                opacity: 0.65
            }
        }).addTo(map);
        map.fitBounds(currentGeoJsonLayer.getBounds());
    } else {
        console.error("No borders found for country code:", countryCode);
    }
}

function populateCountrySelect() {
    $.ajax({
        url: "libs/php/getCountries.php",
        type: "GET",
        dataType: 'json',
        success: function (result) {
            if (result.status.code != 200) {
                console.log('Error reading geoJson file!');
            } else {
                result.data.forEach(data => {
                    console.log('Adding country to select:', data); 
                    $('#countrySelect').append(`<option value="${data.code}">${data.name}</option>`);
                });

                $('#countrySelect').off('change').on('change', function () {
                    const countryCode = $(this).val();
                    const countryName = $('#countrySelect option:selected').text(); 
                    console.log('Country selected from dropdown:', countryCode);
                    displayCountryBorders(countryCode);
                    fetchCountryInfo(countryCode, null, null, countryName); 
                    fetchCountryAirports(countryCode);
                    fetchCountryParks(countryCode);
                    fetchCountryStadiums(countryCode);
                    fetchCountryMuseums(countryCode);
                    fetchCountryHotels(countryCode);
                });
            }
        },
        error: function (xhr, status, error) {
            console.log(xhr);
            console.log('Error');
            console.log(error);
        }
    });
}

function fetchCountryInfo(countryCode, lat = null, lon = null, countryName = null) {
    $.ajax({
        url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
        type: 'GET',
        dataType: 'json',
        success: function (result) {
            console.log('REST Countries API Response:', result); 
            if (result && result.length > 0) {
                const countryInfo = result[0];
                updateCountryInfo(countryInfo);
                detectedCountryName = countryName || countryInfo.name.common;
                capitalName = countryInfo.capital ? countryInfo.capital[0] : 'Unknown'; 
                console.log('Updated detected country name:', detectedCountryName); 
                console.log('Capital city name:', capitalName); 
                const capitalLat = countryInfo.capitalInfo ? countryInfo.capitalInfo.latlng[0] : null;
                const capitalLon = countryInfo.capitalInfo ? countryInfo.capitalInfo.latlng[1] : null;

                if (capitalLat && capitalLon) {
                    addCapitalMarker(capitalName, capitalLat, capitalLon);
                } else {
                    console.error('Invalid capital coordinates:', capitalLat, capitalLon);
                }
            } else {
                console.error('No data found for country code:', countryCode);
            }
        },
        error: function (xhr, status, error) {
            console.log('Error fetching country info:', error);
        }
    });
}

function fetchWikipediaSummary(title, countryCode) {
    if (!title || title.trim() === '') {
        console.error('Title is undefined or empty');
        return;
    }
    $.ajax({
        url: `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.trim())}`,
        type: "GET",
        success: function (result) {
            console.log('Wikipedia Response:', result); 
            if (result.extract) {
                $('#wikiSummary').html(result.extract);
                $('#wikiTitle').html(result.title);
                fetchCountryFlag(countryCode);
            } else {
                $('#wikiSummary').html('No information available.');
                $('#wikiTitle').html('No information available.');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Wikipedia AJAX error: ' + textStatus + ' - ' + errorThrown);
            $('#wikiSummary').html('Failed to fetch Wikipedia information.');
            $('#wikiTitle').html('Failed to fetch Wikipedia information.');
        }
    });
}

function fetchCountryFlag(countryCode) {
    const flagUrl = `https://restcountries.com/v3.1/alpha/${countryCode}`;
    $.ajax({
        url: flagUrl,
        type: "GET",
        dataType: 'json',
        success: function (result) {
            if (result && result[0] && result[0].flags && result[0].flags.png) {
                $('#countryFlag').attr('src', result[0].flags.png);
            } else {
                $('#countryFlag').attr('src', '');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error fetching country flag: ' + textStatus + ' - ' + errorThrown);
            $('#countryFlag').attr('src', '');
        }
    });
}

function fetchCapitalInfo(capital) {
    $.ajax({
        url: `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(capital)}`,
        type: "GET",
        success: function (result) {
            console.log('Wikipedia Capital Response:', result); 
            if (result.extract) {
                $('#capitalSummary').html(result.extract);
                $('#capitalTitle').html(result.title);
                fetchCapitalImage(capital);
            } else {
                $('#capitalSummary').html('No information available.');
                $('#capitalTitle').html('No information available.');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Wikipedia AJAX error: ' + textStatus + ' - ' + errorThrown);
            $('#capitalSummary').html('Failed to fetch Wikipedia information.');
            $('#capitalTitle').html('Failed to fetch Wikipedia information.');
        }
    });
}

function fetchCapitalImage(capital) {
    const query = encodeURIComponent(capital);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${query}`;
    $.ajax({
        url: url,
        type: "GET",
        success: function (result) {
            if (result && result.originalimage && result.originalimage.source) {
                $('#capitalImage').attr('src', result.originalimage.source);
            } else {
                $('#capitalImage').attr('src', '');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error fetching capital image: ' + textStatus + ' - ' + errorThrown);
            $('#capitalImage').attr('src', '');
        }
    });
}

function updateCountryInfo(countryInfo) {
    $('#countryName').html(countryInfo.name.common || 'N/A');
    $('#capital').html(countryInfo.capital ? countryInfo.capital[0] : 'N/A');
    $('#continent').html(countryInfo.region || 'N/A');
    $('#population').html(numeral(countryInfo.population).format('0,0') || 'N/A');
    $('#languages').html(countryInfo.languages ? Object.values(countryInfo.languages).join(', ') : 'N/A');
    $('#area').html(numeral(countryInfo.area).format('0,0') + ' km²' || 'N/A');
    $('#currency').html(countryInfo.currencies ? Object.keys(countryInfo.currencies).join(', ') : 'N/A');
}

function displayError(message) {
    $('#modalInfo .modal-body').html(`
        <div class="alert alert-danger">${message}</div>
    `);
}

function addCapitalMarker(capital, lat, lon) {
    if (capitalMarker) {
        map.removeLayer(capitalMarker);
    }
    const markerIcon = L.ExtraMarkers.icon({
        icon: 'fa-solid fa-landmark-flag',
        markerColor: 'red',
        shape: 'square',
        prefix: 'fa',
        extraClasses: 'fa-2x'
    });
    capitalMarker = L.marker([lat, lon], {
        icon: markerIcon
    }).addTo(map).bindPopup(`<b>${capital}</b>`);
    capitalMarker.on('click', function () {
        fetchCapitalInfo(capital);
        $('#capitalModal').modal('show');
    });
}

function showCountryInfo(countryCode) {
    $.ajax({
        url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
        type: 'GET',
        dataType: 'json',
        success: function (result) {
            console.log('REST Countries API Response:', result);
            if (result && result.length > 0) {
                const countryInfo = result[0];
                updateCountryInfo(countryInfo);
            } else {
                console.error('No data found for country code:', countryCode);
            }
        },
        error: function (xhr, status, error) {
            console.log('Error fetching country info:', error);
        }
    });
}

function fetchWeatherData(lat, lon, countryCode) {
    $.ajax({
        url: 'libs/php/getWeather.php',
        type: 'GET',
        dataType: 'json',
        data: {
            lat: lat,
            lon: lon
        },
        success: function (data) {
            console.log('Weather data:', data);
            updateWeatherInfo(data, countryCode);
        },
        error: function (xhr, status, error) {
            console.log('Error fetching weather data:', error);
        }
    });
}

function updateWeatherInfo(data, countryCode) {
    console.log('Update weather info:', data);
    if (!data || !data.weather || !data.main) {
        $('#currentWeather').html('<p>No weather data available.</p>');
        return;
    }

    const currentTemp = Math.round(data.main.temp);
    const feelsLikeTemp = Math.round(data.main.feels_like);
    const weatherCondition = data.weather[0].description;
    const weatherIcon = getWeatherIcon(data.weather[0].icon);
    const date = new Date();
    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    };
    const currentDate = date.toLocaleDateString('en-GB', options).replace(/ /g, ' ');

    $('#cityName').text(`${capitalName}, ${countryCode}`);
    $('#currentDay').text(currentDate);
    $('#currentTemp').text(`${currentTemp}°C`);
    $('#feelsLikeTemp').text(`Feels like: ${feelsLikeTemp}°C`);
    $('#currentConditions').html(`<i class="${weatherIcon}"></i> ${weatherCondition}`);
}

function getWeatherIcon(icon) {
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud-meatball',
        '04n': 'fas fa-cloud-meatball',
        '09d': 'fas fa-cloud-showers-heavy',
        '09n': 'fas fa-cloud-showers-heavy',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };
    return iconMap[icon] || 'fas fa-question';
}

$('#weatherBtn').click(function () {
    const countryCode = $('#countrySelect').val() || detectedCountryCode;
    if (countryCode === detectedCountryCode) {
        fetchWeatherData(detectedLat, detectedLon, detectedCountryCode);
    } else {
        $.ajax({
            url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
            type: 'GET',
            dataType: 'json',
            success: function (result) {
                if (result && result.length > 0) {
                    const countryInfo = result[0];
                    const lat = countryInfo.latlng[0];
                    const lon = countryInfo.latlng[1];
                    capitalName = countryInfo.capital ? countryInfo.capital[0] : 'Unknown'; 
                    fetchWeatherData(lat, lon, countryCode);
                } else {
                    console.error('No data found for country code:', countryCode);
                }
            },
            error: function (xhr, status, error) {
                console.log('Error fetching country info:', error);
            }
        });
    }
    $('#modalWeather').modal('show');
});

$('#countrySelect').change(function () {
    const countryCode = $(this).val();
    $.ajax({
        url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
        type: 'GET',
        dataType: 'json',
        success: function (result) {
            if (result && result.length > 0) {
                const countryInfo = result[0];
                const lat = countryInfo.latlng[0];
                const lon = countryInfo.latlng[1];
                capitalName = countryInfo.capital ? countryInfo.capital[0] : 'Unknown'; 
                fetchWeatherData(lat, lon, countryCode);
            } else {
                console.error('No data found for country code:', countryCode);
            }
        },
        error: function (xhr, status, error) {
            console.log('Error fetching country info:', error);
        }
    });
});

function fetchCountryAirports(countryCode) {
    airportsCG.clearLayers();
    $.ajax({
        url: "libs/php/getAirports.php",
        type: 'POST',
        dataType: 'json',
        data: {
            countryCode: countryCode
        },
        success: function (result) {
            console.log('API Response:', result); 
            if (result && result.length > 0) {
                const airports = result;
                airports.forEach(airport => {
                    const airportMarker = L.marker([airport.lat, airport.lng], {
                            icon: airportIcon
                        })
                        .bindPopup(`<strong>${airport.name}</strong>`);
                    airportsCG.addLayer(airportMarker);
                });
            } else {
                console.error('No airport data found in the response.');
            }
        },
        error: function (xhr, status, errorThrown) {
            console.error('Error fetching airports:', status, errorThrown);
        }
    });
}

function fetchCountryParks(countryCode) {
    parksCG.clearLayers();
    $.ajax({
        url: "libs/php/getParks.php",
        type: 'POST',
        dataType: 'json',
        data: {
            countryCode: countryCode
        },
        success: function (result) {
            console.log('API Response:', result); 
            if (result && result.length > 0) {
                const parks = result;
                parks.forEach(park => {
                    const parkMarker = L.marker([park.lat, park.lng], {
                            icon: parkIcon
                        })
                        .bindPopup(`<strong>${park.name}</strong>`);
                    parksCG.addLayer(parkMarker);
                });
            } else {
                console.error('No park data found in the response.');
            }
        },
        error: function (xhr, status, errorThrown) {
            console.error('Error fetching parks:', status, errorThrown);
        }
    });
}

function fetchCountryStadiums(countryCode) {
    stadiumsCG.clearLayers();
    $.ajax({
        url: "libs/php/getStadiums.php",
        type: 'POST',
        dataType: 'json',
        data: {
            countryCode: countryCode
        },
        success: function (result) {
            console.log('API Response:', result); 
            if (result && result.length > 0) {
                const stadiums = result;
                stadiums.forEach(stadium => {
                    const stadiumMarker = L.marker([stadium.lat, stadium.lng], {
                            icon: stadiumIcon
                        })
                        .bindPopup(`<strong>${stadium.name}</strong>`);
                        stadiumsCG.addLayer(stadiumMarker);
                    });
                } else {
                    console.error('No stadium data found in the response.');
                }
            },
            error: function (xhr, status, errorThrown) {
                console.error('Error fetching stadiums:', status, errorThrown);
            }
        });
    }
    
    function fetchCountryMuseums(countryCode) {
        museumsCG.clearLayers();
        $.ajax({
            url: "libs/php/getMuseums.php",
            type: 'POST',
            dataType: 'json',
            data: {
                countryCode: countryCode
            },
            success: function (result) {
                console.log('API Response:', result); 
                if (result && result.length > 0) {
                    const museums = result;
                    museums.forEach(museum => {
                        const museumMarker = L.marker([museum.lat, museum.lng], {
                                icon: museumIcon
                            })
                            .bindPopup(`<strong>${museum.name}</strong>`);
                        museumsCG.addLayer(museumMarker);
                    });
                } else {
                    console.error('No museum data found in the response.');
                }
            },
            error: function (xhr, status, errorThrown) {
                console.error('Error fetching museums:', status, errorThrown);
            }
        });
    }
    
    function fetchCountryHotels(countryCode) {
        hotelsCG.clearLayers();
        $.ajax({
            url: "libs/php/getHotels.php",
            type: 'POST',
            dataType: 'json',
            data: {
                countryCode: countryCode
            },
            success: function (result) {
                console.log('API Response:', result);
                if (result && result.length > 0) {
                    const hotels = result;
                    hotels.forEach(hotel => {
                        const hotelMarker = L.marker([hotel.lat, hotel.lng], {
                                icon: hotelIcon
                            })
                            .bindPopup(`<strong>${hotel.name}</strong>`);
                        hotelsCG.addLayer(hotelMarker);
                    });
                } else {
                    console.error('No hotel data found in the response.');
                }
            },
            error: function (xhr, status, errorThrown) {
                console.error('Error fetching hotels:', status, errorThrown);
            }
        });
    }
    
function fetchLatestNews(countryCode) {
    console.log("Fetching news for country code:", countryCode); 
    $.ajax({
        url: 'libs/php/getNews.php',
        type: 'GET',
        data: {
            country: countryCode
        },
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                console.error('Error fetching news:', data.error, data.details);
                $('#newsContent').html('<p class="text-danger">Error fetching news: ' + data.error + '</p>');
            } else {
                console.log('News data:', data); 
                if (data.news && data.news.length > 0) {
                    displayNews(data.news);
                } else {
                    $('#newsContent').html('<p>No news articles found.</p>');
                }
            }
        },
        error: function (xhr, status, error) {
            let errorMessage = 'Error fetching news.';
            if (xhr.status === 502) {
                errorMessage = 'Failed to fetch news due to a server error (502). Please try again later.';
            } else {
                errorMessage = 'Error fetching news: ' + error;
            }
            console.error('Error fetching news:', error);
            $('#newsContent').html('<p class="text-danger">' + errorMessage + '</p>');
        }
    });
}

function displayNews(articles) {
    const newsContent = $('#newsContent');
    newsContent.empty(); 

    if (articles.length === 0) {
        newsContent.append('<p>No news articles found.</p>');
        return;
    }

    let articlesAdded = 0; 

    articles.forEach(article => {
        if (articlesAdded < 5 && article.image && article.image.trim() !== '') {
            const articleHtml = `
                <div class="card mb-3">
                    <img src="${article.image}" class="card-img-top" alt="${article.title}" style="width: 100%; height: auto;">
                    <div class="card-body">
                        <h5 class="card-title">${article.title}</h5>
                        <p class="card-text">${article.description || ''}</p>
                        <p class="card-text"><small class="text-muted">Published at: ${new Date(article.published).toLocaleString()}</small></p>
                        <a href="${article.url}" class="btn btn-primary" target="_blank">Read more</a>
                    </div>
                </div>
            `;
            newsContent.append(articleHtml);
            articlesAdded++;
        }
    });

    if (articlesAdded === 0) {
        newsContent.append('<p>No news articles found with valid images.</p>');
    }
}

    $('#currencyModal').on('show.bs.modal', function () {
    resetCurrencyForm();
    const countryCode = detectedCountryCode || $('#countrySelect').val();
    fetchCurrencies(countryCode);
});

$('#currency-form').on('submit', function (e) {
    e.preventDefault();
    convertCurrency();
});

$('#fromAmount').on('keyup', function () {
    const from = "USD";
    const to = $("#exchangeRate").val();
    const amount = $("#fromAmount").val();
    calResult(from, to, amount);
});

$('#fromAmount').on('change', function () {
    const from = "USD";
    const to = $("#exchangeRate").val();
    const amount = $("#fromAmount").val();
    calResult(from, to, amount);
});

$("#exchangeRate").change(function () {
    const from = "USD";
    const to = $("#exchangeRate").val();
    calResult(from, to);
});

function resetCurrencyForm() {
    $('#fromAmount').val(1);
    $('#exchangeRate').val($('#exchangeRate option:first').val());
    $('#toAmount').val('');
}

function fetchCurrencies(countryCode) {
    $.ajax({
        url: 'libs/php/getCurrencies.php?currencies=true',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            console.log('Fetched data:', data);
            if (data.error) {
                showToast(data.error, 4000, true, "#ffffff");
            } else {
                fetchCountryCurrency(countryCode, function (currencyCode) {
                    populateCurrencySelect(data, currencyCode);
                });
            }
        },
        error: function (xhr, status, error) {
            showToast('Error fetching currencies', 4000, true, "#ffffff");
            console.log('Error details:', error);
        }
    });
}

function fetchCountryCurrency(countryCode, callback) {
    $.ajax({
        url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
        type: 'GET',
        dataType: 'json',
        success: function (result) {
            if (result && result.length > 0) {
                const countryInfo = result[0];
                const currencyCode = Object.keys(countryInfo.currencies)[0];
                callback(currencyCode);
            } else {
                callback(null);
            }
        },
        error: function (xhr, status, error) {
            console.log('Error fetching country currency:', error);
            callback(null);
        }
    });
}

function populateCurrencySelect(currencies, countryCurrencyCode) {
    const select = $('#exchangeRate');
    select.empty();

    $.each(currencies, function(code, name) {
        console.log('Adding option:', code, name);
        select.append($('<option>', { value: code, text: `${name} (${code})` }));
    });

    if (countryCurrencyCode) {
        select.val(countryCurrencyCode);
    } else {
        select.val(select.find('option:first').val());
    }

    const from = "USD";
    const to = select.val();
    calResult(from, to);
}

function calResult(from, to, amount = 1) {
    $.ajax({
        url: 'libs/php/getExchangeRate.php',
        type: 'POST',
        dataType: 'json',
        data: { from: from, to: to, amount: amount },
        success: function (result) {
            if (result && result.convertedAmount) {
                const convertedRate = numeral(result.convertedAmount).format("0,0.00");
                $("#toAmount").val(convertedRate);
            } else {
                showToast('Error retrieving currency data', 4000, true, "#ffffff");
            }
        },
        error: function (jqXHR, status, errorThrown) {
            showToast('Error retrieving currency data', 4000, true, "#ffffff");
        }
    });
}

function convertCurrency() {
    const from = "USD";
    const to = $("#exchangeRate").val();
    const amount = $("#fromAmount").val();
    calResult(from, to, amount);
    showToast("Conversion successful!", 4000, true, "#ffffff");
}
