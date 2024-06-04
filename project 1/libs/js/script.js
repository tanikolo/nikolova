$(window).on('load', function () {
    if ($('#preloader').length) {
        $('#preloader').delay(1000).fadeOut('slow', function () {
            $(this).remove();
        });
    }
});

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

function showToast(message, duration, close) {
    Toastify({
        text: message,
        duration: duration,
        newWindow: true,
        close: close,
        gravity: "top", 
        position: "center", 
        stopOnFocus: true, 
        style: {
            background: "#ffc007",
            color: "#0E46A3",
            borderRadius: "10px"
        },
        onClick: function () {} 
     }).showToast();
 }

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

    L.control.layers(baselayers, overlays, {
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
                $('#weatherModal').modal('show');
            }
        }]
    }).addTo(map);

    const currencyBtn = L.easyButton({
        position: 'topleft',
        states: [{
            stateName: 'show-currency-modal',
            icon: '<i class="fab fa-dollar-sign fa-responsive text-dark"></i>',
            title: 'Currency calculator',
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
        url: 'libs/php/getCountryFeature.php',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            countryBorders = data;
            removePreloader(); 
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
                url: 'libs/php/getCountryCode.php',
                type: 'GET',
                dataType: 'json',
                data: {
                    lat: lat,
                    lon: lon
                },
                success: function (data) {
                    if (data.status.code === 200) {
                        const countryCode = data.countryCode;
                        $('#countrySelect').val(countryCode).change();
                    } else {
                        console.error('Error fetching country code:', data.status.description);
                    }
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

function updateCountryInfo(countryInfo) {
    $('#countryName').html(countryInfo.name.common || 'N/A');
    $('#capital').html(countryInfo.capital ? countryInfo.capital[0] : 'N/A');
    $('#continent').html(countryInfo.region || 'N/A');
    $('#population').html(numeral(countryInfo.population).format('0,0') || 'N/A');
    $('#languages').html(countryInfo.languages ? Object.values(countryInfo.languages).join(', ') : 'N/A');
    $('#area').html(numeral(countryInfo.area).format('0,0') + ' km²' || 'N/A');
    $('#currency').html(countryInfo.currencies ? Object.keys(countryInfo.currencies).join(', ') : 'N/A');
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
    }).addTo(map)
    .bindPopup(`<b>${capital}</b>`);

    capitalMarker.on('click', function () {
        fetchCapitalInfo(capital);
        $('#capitalModal').modal('show');
    });
}

$('#countrySelect').change(async function () {
    const countryCode = $(this).val();
    await removePreviousData(); 
    fetchAndDisplayCountryBorders(countryCode);
    fetchCountryInfo(countryCode);
    fetchCountryAirports(countryCode);
    fetchCountryParks(countryCode);
    fetchCountryStadiums(countryCode);
    fetchCountryMuseums(countryCode);
    fetchCountryHotels(countryCode);
});

async function removePreviousData() {
    await removeCapitalMarker(); 
    removeAllMarkers(); 
    if (currentGeoJsonLayer) {
        map.removeLayer(currentGeoJsonLayer); 
        currentGeoJsonLayer = null;
    }
}

function removeAllMarkers() {
    airportsCG.clearLayers();
    parksCG.clearLayers();
    stadiumsCG.clearLayers();
    museumsCG.clearLayers();
    hotelsCG.clearLayers();
}

function removeCapitalMarker() {
    return new Promise((resolve) => {
        if (capitalMarker) {
            map.removeLayer(capitalMarker);
            capitalMarker = null;
        }
        resolve();
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
            if (result.extract) {
                $('#wikiSummary').html(result.extract);
                $('#wikiTitle').html(result.title);
                fetchCountryFlag(countryCode);
                $('.pre-load').addClass("fadeOut"); 
            } else {
                $('#wikiSummary').html('No information available.');
                $('#wikiTitle').html('No information available.');
                $('.pre-load').addClass("fadeOut"); 
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Wikipedia AJAX error: ' + textStatus + ' - ' + errorThrown);
            $('#wikiSummary').html('Failed to fetch Wikipedia information.');
            $('#wikiTitle').html('Failed to fetch Wikipedia information.');
            $('.pre-load').addClass("fadeOut"); 
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
            if (result.extract) {
                $('#capitalSummary').html(result.extract);
                $('#capitalTitle').html(result.title);
                fetchCapitalImage(capital);
                $('.pre-load').addClass("fadeOut"); 
            } else {
                $('#capitalSummary').html('No information available.');
                $('#capitalTitle').html('No information available.');
                $('.pre-load').addClass("fadeOut"); 
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Wikipedia AJAX error: ' + textStatus + ' - ' + errorThrown);
            $('#capitalSummary').html('Failed to fetch Wikipedia information.');
            $('#capitalTitle').html('Failed to fetch Wikipedia information.');
            $('.pre-load').addClass("fadeOut"); 
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

$('#weatherModal').on('show.bs.modal', function (e) {
    $('.pre-load').removeClass("fadeOut"); 

    const countryCode = $('#countrySelect').val() || detectedCountryCode;

    $.ajax({
        url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
        type: 'GET',
        dataType: 'json',
        success: function (result) {
            if (result && result[0]) {
                const countryInfo = result[0];
                const capitalLat = countryInfo.capitalInfo ? countryInfo.capitalInfo.latlng[0] : null;
                const capitalLon = countryInfo.capitalInfo ? countryInfo.capitalInfo.latlng[1] : null;
                capitalName = countryInfo.capital ? countryInfo.capital[0] : 'Unknown';
                const countryName = countryInfo.name.common;

                if (capitalLat && capitalLon) {
                    fetchWeatherData(capitalLat, capitalLon, capitalName, countryName);
                } else {
                    $('#weatherModalLabel').text("Error retrieving data");
                    $('.pre-load').addClass("fadeOut"); 
                }
            } else {
                $('#weatherModalLabel').text("Error retrieving data");
                $('.pre-load').addClass("fadeOut"); 
            }
        },
        error: function (xhr, status, error) {
            $('#weatherModalLabel').text("Error retrieving data");
            $('.pre-load').addClass("fadeOut"); 
        }
    });
});

function fetchWeatherData(lat, lon, capitalName, countryName) {
    $.ajax({
        url: 'libs/php/getWeather.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat: lat,
            lon: lon
        },
        success: function (result) {
            const resultCode = result.status.code;

            if (resultCode === 200) {
                const d = result.data;

                $('#weatherModalLabel').html(`${capitalName}, ${countryName}`);

                $('#todayConditions').html(d.forecast[0].conditionText);
                $('#todayIcon').attr("src", `https://openweathermap.org/img/wn/${d.forecast[0].conditionIcon}@2x.png`);
                $('#todayMaxTemp').html(numeral(d.forecast[0].maxC).format('0'));
                $('#todayMinTemp').html(numeral(d.forecast[0].minC).format('0'));

                $('#day1Date').text(Date.parse(d.forecast[1].date).toString("ddd dS"));
                $('#day1Icon').attr("src", `https://openweathermap.org/img/wn/${d.forecast[1].conditionIcon}@2x.png`);
                $('#day1MinTemp').text(numeral(d.forecast[1].minC).format('0'));
                $('#day1MaxTemp').text(numeral(d.forecast[1].maxC).format('0'));

                $('#day2Date').text(Date.parse(d.forecast[2].date).toString("ddd dS"));
                $('#day2Icon').attr("src", `https://openweathermap.org/img/wn/${d.forecast[2].conditionIcon}@2x.png`);
                $('#day2MinTemp').text(numeral(d.forecast[2].minC).format('0'));
                $('#day2MaxTemp').text(numeral(d.forecast[2].maxC).format('0'));

                $('#day3Date').text(Date.parse(d.forecast[3].date).toString("ddd dS"));
                $('#day3Icon').attr("src", `https://openweathermap.org/img/wn/${d.forecast[3].conditionIcon}@2x.png`);
                $('#day3MinTemp').text(numeral(d.forecast[3].minC).format('0'));
                $('#day3MaxTemp').text(numeral(d.forecast[3].maxC).format('0'));

                $('#lastUpdated').text(Date.parse(d.lastUpdated).toString("HH:mm, dS MMM"));

                $('.pre-load').addClass("fadeOut"); 
            } else {
                $('#weatherModalLabel').text("Error retrieving data");
                $('.pre-load').addClass("fadeOut"); 
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('#weatherModalLabel').text("Error retrieving data");
            $('.pre-load').addClass("fadeOut"); 
        }
    });
}

$('#weatherModal').on('hidden.bs.modal', function (e) {
    $('.pre-load').removeClass("fadeOut"); 

    $('#todayConditions').html("");
    $('#todayIcon').attr("src", "");
    $('#todayMaxTemp').html("");
    $('#todayMinTemp').html("");

    $('#day1Date').text("");
    $('#day1Icon').attr("src", "");
    $('#day1MinTemp').text("");
    $('#day1MaxTemp').text("");

    $('#day2Date').text("");
    $('#day2Icon').attr("src", "");
    $('#day2MinTemp').text("");
    $('#day2MaxTemp').text("");

    $('#day3Date').text("");
    $('#day3Icon').attr("src", "");
    $('#day3MinTemp').text("");
    $('#day3MaxTemp').text("");

    $('#lastUpdated').text("");
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
            if (result && result.length > 0) {
                const airports = result;
                airports.forEach(airport => {
                    const airportMarker = L.marker([airport.lat, airport.lng], {
                            icon: airportIcon
                        })
                        .bindPopup(`<strong>${airport.name}</strong>`);
                    airportsCG.addLayer(airportMarker);
                });
                removePreloader(); 
            } else {
                showToast("No airport information is available for this region", 4000, false);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            showToast("Airports - server error", 4000, false);
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
            if (result && result.length > 0) {
                const parks = result;
                parks.forEach(park => {
                    const parkMarker = L.marker([park.lat, park.lng], {
                            icon: parkIcon
                        })
                        .bindPopup(`<strong>${park.name}</strong>`);
                    parksCG.addLayer(parkMarker);
                });
                removePreloader(); 
            } else {
                showToast("No park information is available for this region", 4000, false);
            }
        },
        error: function (xhr, status, errorThrown) {
            showToast("Parks - server error", 4000, false);
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
            if (result && result.length > 0) {
                const stadiums = result;
                stadiums.forEach(stadium => {
                    const stadiumMarker = L.marker([stadium.lat, stadium.lng], {
                            icon: stadiumIcon
                        })
                        .bindPopup(`<strong>${stadium.name}</strong>`);
                    stadiumsCG.addLayer(stadiumMarker);
                });
                removePreloader(); 
            } else {
                showToast("No stadium information is available for this region", 4000, false);
            }
        },
        error: function (xhr, status, errorThrown) {
            showToast("Stadiums - server error", 4000, false);
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
            if (result && result.length > 0) {
                const museums = result;
                museums.forEach(museum => {
                    const museumMarker = L.marker([museum.lat, museum.lng], {
                            icon: museumIcon
                        })
                        .bindPopup(`<strong>${museum.name}</strong>`);
                    museumsCG.addLayer(museumMarker);
                });
                removePreloader(); 
            } else {
                showToast("No museum information is available for this region", 4000, false);
            }
        },
        error: function (xhr, status, errorThrown) {
            showToast("Museums - server error", 4000, false);
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
            if (result && result.length > 0) {
                const hotels = result;
                hotels.forEach(hotel => {
                    const hotelMarker = L.marker([hotel.lat, hotel.lng], {
                            icon: hotelIcon
                        })
                        .bindPopup(`<strong>${hotel.name}</strong>`);
                    hotelsCG.addLayer(hotelMarker);
                });
                removePreloader(); 
            } else {
                showToast("No hotel information is available for this region", 4000, false);
            }
        },
        error: function (xhr, status, errorThrown) {
            showToast("Hotels - server error", 4000, false);
        }
    });
}

function fetchLatestNews(countryCode, capitalCity) {
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
                $('#newsContent').html('<p class="text-danger">No latest news are available for this region now.</p>');
                $('.pre-load').addClass("fadeOut"); 
            } else {
                if (data.news && data.news.length > 0) {
                    displayNews(data.news);
                } else {
                    $('#newsContent').html('<p>No news articles found.</p>');
                    $('.pre-load').addClass("fadeOut"); 
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
            $('.pre-load').addClass("fadeOut"); 
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

    articles.sort((a, b) => new Date(b.published) - new Date(a.published));

    articles.forEach(article => {
        const articleImage = article.image && article.image !== "None" ? `<img src="${article.image}" class="card-img-top" alt="${article.title}" style="width: 100%; height: auto;">` : '';
        const timeAgo = timeDifference(new Date(), new Date(article.published));

        const articleHtml = `
            <div class="card mb-3">
                ${articleImage}
                <div class="card-body">
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text">${article.description || ''}</p>
                    <p class="card-text"><small class="text-muted">Published: ${timeAgo}</small></p>
                </div>
            </div>
        `;
        newsContent.append(articleHtml);
    });

    $('.pre-load').addClass("fadeOut"); 
}

function timeDifference(current, previous) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed/1000) + ' seconds ago';   
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    } else if (elapsed < msPerDay) {
        return Math.round(elapsed/msPerHour) + ' hours ago';   
    } else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    } else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    } else {
        return Math.round(elapsed/msPerYear) + ' years ago';   
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
                    $('#countrySelect').append(`<option value="${data.code}">${data.name}</option>`);
                });

                $('#countrySelect').off('change').on('change', function () {
                    const countryCode = $(this).val();
                    const countryName = $('#countrySelect option:selected').text();
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

function displayCountryBorders(countryCode) {
    $.ajax({
        url: 'libs/php/getCountryFeature.php',
        type: 'GET',
        dataType: 'json',
        data: {
            countryCode: countryCode
        },
        success: function (response) {
            if (response.status.code === 200) {
                const countryFeature = response.data;

                if (currentGeoJsonLayer) {
                    map.removeLayer(currentGeoJsonLayer);
                }

                currentGeoJsonLayer = L.geoJSON(countryFeature, {
                    style: {
                        color: "#0E46A3",
                        weight: 4,
                        opacity: 0.65
                    }
                }).addTo(map);
                map.fitBounds(currentGeoJsonLayer.getBounds());
                removeAllMarkers();
            } else {
                console.error('Error:', response.status.description);
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error:', status, error);
        }
    });
}

function fetchCountryInfo(countryCode, lat = null, lon = null, countryName = null, retries = 3) {
    $.ajax({
        url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
        type: 'GET',
        dataType: 'json',
        success: function (result) {
            if (result && result.length > 0) {
                const countryInfo = result[0];
                updateCountryInfo(countryInfo);
                detectedCountryName = countryName || countryInfo.name.common;
                capitalName = countryInfo.capital ? countryInfo.capital[0] : 'Unknown';

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
            $('.pre-load').addClass("fadeOut"); 
        },
        error: function (xhr, status, error) {
            if (retries > 0) {
                console.warn(`Retrying... (${3 - retries} retries left)`);
                setTimeout(() => fetchCountryInfo(countryCode, lat, lon, countryName, retries - 1), 2000);
            } else {
                console.log('Error fetching country info:', error);
            }
            $('.pre-load').addClass("fadeOut"); 
        }
    });
}

function showCountryInfo(countryCode) {
    fetchCountryInfo(countryCode);
}

$(document).ready(function() {
    $('#currencyModal').on('show.bs.modal', function () {
        $('.pre-load').removeClass("fadeOut");
        resetCurrencyForm();
        fetchCurrencies();
    });

    $('#currency-form').on('submit', function(e) {
        e.preventDefault();
        convertCurrency();
    });

    $('#fromAmount').on('keyup', function () {
        calcResult();
    });

    $('#fromAmount').on('change', function () {
        calcResult();
    });

    $('#exchangeRate').on('change', function () {
        calcResult();
    });

    function resetCurrencyForm() {
        $('#fromAmount').val(1);
        $('#exchangeRate').val($('#exchangeRate option:first').val());
        $('#toAmount').val('');
    }

    function fetchCurrencies() {
        $.ajax({
            url: 'libs/php/getCurrencies.php?currencies=true',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                console.log('Fetched data:', data); 
                if (data.error) {
                    showToast(data.error, 4000, true, "#ffffff");
                } else {
                    populateCurrencySelect(data);
                }
                $('.pre-load').addClass("fadeOut"); 
            },
            error: function (xhr, status, error) {
                showToast('Error fetching currencies', 4000, true, "#ffffff");
                console.log('Error details:', error); 
                $('.pre-load').addClass("fadeOut"); 
            }
        });
    }

    function populateCurrencySelect(currencies) {
        const select = $('#exchangeRate');
        select.empty();

        const currencyArray = Object.entries(currencies);

        currencyArray.forEach(([code, name]) => {
            console.log('Adding option:', code, name); 
            select.append($('<option>', { value: code, text: `${name} (${code})` }));
        });

        const currencyCountryCode = detectedCountryCode || $('#countrySelect').val();
        setCurrencyForCountry(currencyCountryCode);
    }

    function setCurrencyForCountry(countryCode) {
        $.ajax({
            url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
            type: 'GET',
            dataType: 'json',
            success: function (result) {
                if (result && result.length > 0) {
                    const countryInfo = result[0];
                    const currencyCode = Object.keys(countryInfo.currencies)[0];
                    $('#exchangeRate').val(currencyCode).change();
                } else {
                    console.error('No data found for country code:', countryCode);
                }
            },
            error: function (xhr, status, error) {
                console.log('Error fetching country info:', error);
            }
        });
    }

    function calcResult() {
        const fromAmount = parseFloat($('#fromAmount').val());
        const exchangeRateCode = $('#exchangeRate').val();

        console.log('From Amount:', fromAmount);
        console.log('Selected Exchange Rate Code:', exchangeRateCode);

        if (isNaN(fromAmount) || !exchangeRateCode || fromAmount <= 0) {
            $('#toAmount').val('');
            showToast("Invalid input. Please enter a valid amount.", 4000, true, "#ffffff");
            return;
        }

        fetchExchangeRate(exchangeRateCode, function(exchangeRate) {
            const result = fromAmount * exchangeRate;
            console.log('Result:', result);
            $('#toAmount').val(numeral(result).format("0,0.00"));
            $('.pre-load').addClass("fadeOut"); 
        });
    }

    function fetchExchangeRate(code, callback) {
        $.ajax({
            url: 'libs/php/getExchangeRates.php',
            type: 'POST',
            data: { code: code },
            dataType: 'json',
            success: function(data) {
                console.log('Fetched exchange rate data:', data); 
                if (data && data.rate) {
                    callback(data.rate);
                } else {
                    showToast('Error fetching exchange rate', 4000, true, "#ffffff");
                }
                $('.pre-load').addClass("fadeOut"); 
            },
            error: function(xhr, status, error) {
                showToast('Error fetching exchange rate', 4000, true, "#ffffff");
                console.log('Error details:', error); 
                $('.pre-load').addClass("fadeOut"); 
            }
        });
    }

    function convertCurrency() {
        const fromAmount = parseFloat($('#fromAmount').val());
        const exchangeRateCode = $('#exchangeRate').val();

        console.log('From Amount:', fromAmount);
        console.log('Selected Exchange Rate Code:', exchangeRateCode);

        if (isNaN(fromAmount) || !exchangeRateCode || fromAmount <= 0) {
            showToast("Invalid input. Please enter a valid amount.", 4000, true, "#ffffff");
            return;
        }

        fetchExchangeRate(exchangeRateCode, function(exchangeRate) {
            const toAmount = fromAmount * exchangeRate;
            console.log('To Amount:', toAmount);
            $('#toAmount').val(toAmount.toFixed(2));
            showToast("Conversion successful!", 4000, true, "#ffffff");
            $('.pre-load').addClass("fadeOut"); 
        });
    }
    
    $('#modalInfo').on('show.bs.modal', function () {
        $('.pre-load').removeClass("fadeOut");
    });

    $('#wikiModal').on('show.bs.modal', function () {
        $('.pre-load').removeClass("fadeOut");
    });

    $('#capitalModal').on('show.bs.modal', function () {
        $('.pre-load').removeClass("fadeOut");
    });

    $('#newsModal').on('show.bs.modal', function () {
        $('.pre-load').removeClass("fadeOut");
    });
});

function removePreloader() {
    if ($('#preloader').length) {
        $('#preloader').fadeOut('slow', function () {
            $(this).remove();
        });
    }
}
