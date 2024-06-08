$(document).ready(function () {
    // Function to hide preloader
    function hidePreloader() {
        $('#preloader').addClass('hidden');
    }

    // Show the preloader on page load
    $(window).on('load', function () {
        $('#preloader').removeClass('hidden');
    });

    function showToast(message, duration, close) {
        Toastify({
            text: message,
            duration: duration,
            close: close,
            gravity: "top",
            position: "center",
            stopOnFocus: true,
            style: {
                background: "#ffc107",
                color: "#0E46A3",
                borderRadius: "10px"
            }
        }).showToast();
    }

    let map;
    let currentGeoJsonLayer = null;
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
                    fetchCapitalWeather(countryCode);
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
                    $('#newsModal').modal('show');
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
                showToast('Failed to retrieve access token', 4000, true);
            }
        },
        error: function (xhr, status, error) {
            showToast('Error fetching access token', 4000, true);
        }
    });

    function loadCountryBorders() {
        $.ajax({
            url: 'libs/php/getCountryFeature.php',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                countryBorders = data;
            },
            error: function (xhr, status, error) {
                showToast('Error loading country borders', 4000, true);
            }
        });
    }

    function detectUserCountry() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

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
                            detectedCountryCode = countryCode;
                            detectedCountryName = data.countryName;
                            $('#countrySelect').val(countryCode).change();
                        } else {
                            showToast('Error fetching country code', 4000, true);
                        }
                        // Hide preloader after first country data is loaded
                        hidePreloader();
                    },
                    error: function (xhr, status, error) {
                        showToast('Error detecting user country', 4000, true);
                        // Hide preloader in case of error
                        hidePreloader();
                    }
                });
            }, function (error) {
                showToast('Error in geolocation: ' + error.message, 4000, true);
                // Hide preloader in case of error
                hidePreloader();
            });
        } else {
            showToast("Geolocation is not supported by this browser.", 4000, true);
            // Hide preloader in case geolocation is not supported
            hidePreloader();
        }
    }

    $('#countrySelect').change(function () {
        const countryCode = $(this).val();
        fetchCapitalWeather(countryCode);
    });

    function fetchCapitalWeather(countryCode) {
        $.ajax({
            url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
            type: 'GET',
            dataType: 'json',
            success: function (result) {
                if (result && result.length > 0) {
                    const countryInfo = result[0];
                    const lat = countryInfo.capitalInfo.latlng[0];
                    const lon = countryInfo.capitalInfo.latlng[1];
                    capitalName = countryInfo.capital ? countryInfo.capital[0] : 'Unknown';
                    console.log(`Capital Coordinates: ${capitalName}, ${countryInfo.name.common}: lat=${lat}, lon=${lon}`);
                    fetchWeatherData(lat, lon, capitalName, countryInfo.name.common);
                } else {
                    showToast('No data found for country code', 4000, true);
                }
            },
            error: function (xhr, status, error) {
                showToast('Error fetching country info', 4000, true);
            }
        });
    }

    function fetchWeatherData(lat, lon, capital, country) {
        console.log(`Fetching weather data for ${capital}, ${country}: lat=${lat}, lon=${lon}`);
        $.ajax({
            url: "libs/php/getWeather.php",
            type: 'POST',
            dataType: 'json',
            data: {
                lat: lat,
                lon: lon
            },
            success: function (result) {
                console.log('Weather API response:', result);
                if (result.status.code === 200) {
                    var d = result.data;
                    $('#weatherModalLabel').html(capital + ", " + country);
                    $('#todayConditions').html(d.forecast[0].conditionText);
                    $('#todayIcon').attr("src", d.forecast[0].conditionIcon);
                    $('#todayMaxTemp').html(numeral(d.forecast[0].maxC).format('0'));
                    $('#todayMinTemp').html(numeral(d.forecast[0].minC).format('0'));
                    $('#day1Date').text(new Date(d.forecast[1].date).toString("ddd dS"));
                    $('#day1Icon').attr("src", d.forecast[1].conditionIcon);
                    $('#day1MinTemp').text(numeral(d.forecast[1].minC).format('0'));
                    $('#day1MaxTemp').text(numeral(d.forecast[1].maxC).format('0'));
                    $('#day2Date').text(new Date(d.forecast[2].date).toString("ddd dS"));
                    $('#day2Icon').attr("src", d.forecast[2].conditionIcon);
                    $('#day2MinTemp').text(numeral(d.forecast[2].minC).format('0'));
                    $('#day2MaxTemp').text(numeral(d.forecast[2].maxC).format('0'));
                    $('#day3Date').text(new Date(d.forecast[3].date).toString("ddd dS")); // Update for the third day
                    $('#day3Icon').attr("src", d.forecast[3].conditionIcon); // Update for the third day
                    $('#day3MinTemp').text(numeral(d.forecast[3].minC).format('0')); // Update for the third day
                    $('#day3MaxTemp').text(numeral(d.forecast[3].maxC).format('0')); // Update for the third day
                    $('#lastUpdated').text(new Date(d.lastUpdated).toString("HH:mm, dS MMM"));
                    $('.pre-load').addClass("fadeOut"); // Hide the spinner
                } else {
                    showToast('Error retrieving data', 4000, true);
                    $('.pre-load').addClass("fadeOut"); // Hide the spinner in case of error
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showToast('Error retrieving data', 4000, true);
                $('.pre-load').addClass("fadeOut"); // Hide the spinner in case of error
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
        $('#day3Date').text(""); // Reset for the third day
        $('#day3Icon').attr("src", ""); // Reset for the third day
        $('#day3MinTemp').text(""); // Reset for the third day
        $('#day3MaxTemp').text(""); // Reset for the third day
        $('#lastUpdated').text("");
    });

     $('#currencyModal').on('show.bs.modal', function () {
        $('.pre-load').removeClass("fadeOut");
        resetCurrencyForm();
        const countryCode = $('#countrySelect').val() || detectedCountryCode;
        fetchCurrencies(countryCode);
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
                    populateCurrencySelect(data);
                    setCurrencyForCountry(countryCode); // Ensure currency is set after fetching
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
                    console.log('Selected Exchange Rate Code:', currencyCode); // Log the selected currency code
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

    $('#countrySelect').change(function () {
        const countryCode = $(this).val();
        removePreviousData();
        displayCountryBorders(countryCode);
        fetchCountryInfo(countryCode);
        fetchCountryAirports(countryCode);
        fetchCountryParks(countryCode);
        fetchCountryStadiums(countryCode);
        fetchCountryMuseums(countryCode);
        fetchCountryHotels(countryCode);
        setCurrencyForCountry(countryCode); // Add this line to update currency when country changes
    });
    $('#countrySelect').change(function () {
        const countryCode = $(this).val();
        removePreviousData();
        displayCountryBorders(countryCode);
        fetchCountryInfo(countryCode);
        fetchCountryAirports(countryCode);
        fetchCountryParks(countryCode);
        fetchCountryStadiums(countryCode);
        fetchCountryMuseums(countryCode);
        fetchCountryHotels(countryCode);
        setCurrencyForCountry(countryCode); // Add this line to update currency when country changes
    });
    
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
        removeCapitalMarker();

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
            $('#capitalModal').modal('show');
        });
    }

    $('#countrySelect').change(function () {
        const countryCode = $(this).val();
        removePreviousData();
        displayCountryBorders(countryCode);
        fetchCountryInfo(countryCode);
        fetchCountryAirports(countryCode);
        fetchCountryParks(countryCode);
        fetchCountryStadiums(countryCode);
        fetchCountryMuseums(countryCode);
        fetchCountryHotels(countryCode);
    });

    function removePreviousData() {
        removeCapitalMarker();
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
        if (capitalMarker) {
            map.removeLayer(capitalMarker);
            capitalMarker = null;
        }
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
                    showToast('No flag available for this country', 4000, true);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showToast('Error fetching country flag', 4000, true);
                $('#countryFlag').attr('src', '');
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
                    showToast('No image available for this capital', 4000, true);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showToast('Error fetching capital image', 4000, true);
                $('#capitalImage').attr('src', '');
            }
        });
    }

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
                } else {
                    showToast("No airport information is available for this region", 4000, true);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showToast("Airports - server error", 4000, true);
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
                } else {
                    showToast("No park information is available for this region", 4000, true);
                }
            },
            error: function (xhr, status, errorThrown) {
                showToast("Parks - server error", 4000, true);
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
                } else {
                    showToast("No stadium information is available for this region", 4000, true);
                }
            },
            error: function (xhr, status, errorThrown) {
                showToast("Stadiums - server error", 4000, true);
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
                } else {
                    showToast("No museum information is available for this region", 4000, true);
                }
            },
            error: function (xhr, status, errorThrown) {
                showToast("Museums - server error", 4000, true);
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
                } else {
                    showToast("No hotel information is available for this region", 4000, true);
                }
            },
            error: function (xhr, status, errorThrown) {
                showToast("Hotels - server error", 4000, true);
            }
        });
    }

    $('#newsModal').on('show.bs.modal', function () {
        $('.pre-load').removeClass("fadeOut");
        const countryCode = $('#countrySelect').val() || detectedCountryCode;

        let newsLoaded = false;

        $.ajax({
            url: 'libs/php/getNews.php',
            type: 'GET',
            data: {
                country: countryCode
            },
            dataType: 'json',
            timeout: 5000, // Set timeout to 5 seconds
            success: function (data) {
                const newsContent = $('#newsContent');
                newsContent.empty();

                if (data.error) {
                    if (!newsLoaded) {
                        newsContent.html('<p class="text-danger">No latest news are available for this region now.</p>');
                    }
                } else if (data.news && data.news.length > 0) {
                    newsLoaded = true;
                    const articles = data.news;
                    articles.sort((a, b) => new Date(b.published) - new Date(a.published));
                    articles.forEach(article => {
                        const timeAgo = timeDifference(new Date(), new Date(article.published));
                        const articleHtml = `
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title">${article.title}</h5>
                                    <p class="card-text">${article.description || ''}</p>
                                    <p class="card-text"><small class="text-muted">Published: ${timeAgo}</small></p>
                                </div>
                            </div>
                        `;
                        const articleElement = $(articleHtml);
                        if (article.image && article.image !== "None") {
                            const img = new Image();
                            img.src = article.image;
                            img.className = "card-img-top";
                            img.style = "width: 100%; height: auto;";
                            img.alt = article.title;
                            img.onload = function () {
                                articleElement.prepend(img);
                            };
                            img.onerror = function () {
                                console.warn('Image failed to load: ' + article.image);
                            };
                        }
                        newsContent.append(articleElement);
                    });
                    $('.pre-load').addClass("fadeOut");
                } else {
                    if (!newsLoaded) {
                        newsContent.html('<p class="text-danger">No latest news are available for this region now.</p>');
                    }
                    $('.pre-load').addClass("fadeOut");
                }
            },
            error: function (xhr, textStatus, error) {
                if (!newsLoaded) {
                    $('#newsContent').html('<p class="text-danger">No latest news are available for this region now.</p>');
                }

                // Show toast instead of console error
                const response = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                if (textStatus !== 'timeout' && (!response.error || response.error !== 'No news available')) {
                    showToast('Failed to fetch news: ' + error, 4000, false);
                }

                $('.pre-load').addClass("fadeOut");
            }
        });
    });

    $('#newsModal').on('hidden.bs.modal', function (e) {
        $('.pre-load').removeClass("fadeOut");
    });

    function timeDifference(current, previous) {
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        const msPerMonth = msPerDay * 30;
        const msPerYear = msPerDay * 365;

        const elapsed = current - previous;

        if (elapsed < msPerMinute) {
            return Math.round(elapsed / 1000) + ' seconds ago';
        } else if (elapsed < msPerHour) {
            return Math.round(elapsed / msPerMinute) + ' minutes ago';
        } else if (elapsed < msPerDay) {
            return Math.round(elapsed / msPerHour) + ' hours ago';
        } else if (elapsed < msPerMonth) {
            return Math.round(elapsed / msPerDay) + ' days ago';
        } else if (elapsed < msPerYear) {
            return Math.round(elapsed / msPerMonth) + ' months ago';
        } else {
            return Math.round(elapsed / msPerYear) + ' years ago';
        }
    }

    function populateCountrySelect() {
        $.ajax({
            url: "libs/php/getCountries.php",
            type: "GET",
            dataType: 'json',
            success: function (result) {
                if (result.status.code != 200) {
                    showToast('Error reading geoJson file!', 4000, true);
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
                showToast('Error fetching country list', 4000, true);
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
                    showToast('Error retrieving country borders', 4000, true);
                }
            },
            error: function (xhr, status, error) {
                showToast('Error retrieving country borders', 4000, true);
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
                        showToast('Invalid capital coordinates', 4000, true);
                    }
                } else {
                    showToast('No data found for country code', 4000, true);
                }
            },
            error: function (xhr, status, error) {
                if (retries > 0) {
                    setTimeout(() => fetchCountryInfo(countryCode, lat, lon, countryName, retries - 1), 2000);
                } else {
                    showToast('Error fetching country info', 4000, true);
                }
            }
        });
    }

    function showCountryInfo(countryCode) {
        fetchCountryInfo(countryCode);
    }

    $('#modalInfo').on('show.bs.modal', function () {
        $('.pre-load').removeClass("fadeOut");
        const countryCode = $('#countrySelect').val();

        if (countryCode) {
            $.ajax({
                url: `https://restcountries.com/v3.1/alpha/${countryCode}`,
                type: 'GET',
                dataType: 'json',
                success: function (result) {
                    if (result && result[0]) {
                        const countryInfo = result[0];
                        $('#countryName').html(countryInfo.name.common);
                        $('#capital').html(countryInfo.capital ? countryInfo.capital[0] : 'N/A');
                        $('#continent').html(countryInfo.region);
                        $('#languages').html(Object.values(countryInfo.languages).join(', '));
                        $('#currency').html(Object.keys(countryInfo.currencies).join(', '));
                        $('#population').html(numeral(countryInfo.population).format("0,0"));
                        $('#area').html(numeral(countryInfo.area).format("0,0") + ' km²');
                        $('.pre-load').addClass("fadeOut");
                    } else {
                        showToast("Error retrieving country data", 4000, true);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    showToast("country info - server error", 4000, true);
                }
            });
        }
    });

    $('#modalInfo').on('hidden.bs.modal', function (e) {
        $('.pre-load').removeClass("fadeOut");
    });

    $('#wikiModal').on('show.bs.modal', function () {
        $('.pre-load').removeClass("fadeOut");
        const countryName = $('#countrySelect option:selected').text() !== "Select country..." ? $('#countrySelect option:selected').text() : detectedCountryName;
        const countryCode = $('#countrySelect').val() || detectedCountryCode;

        if (countryName) {
            $.ajax({
                url: `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName.trim())}`,
                type: 'GET',
                dataType: 'json',
                success: function (result) {
                    if (result.extract) {
                        $('#wikiSummary').html(result.extract);
                        $('#wikiTitle').html(result.title);
                        fetchCountryFlag(countryCode); // Ensure this function is updated
                        $('.pre-load').addClass("fadeOut");
                    } else {
                        $('#wikiSummary').html('No information available.');
                        $('#wikiTitle').html('No information available.');
                        $('.pre-load').addClass("fadeOut");
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $('#wikiSummary').html('Failed to fetch Wikipedia information.');
                    $('#wikiTitle').html('Failed to fetch Wikipedia information.');
                    showToast("Wikipedia info - server error", 4000, true);
                    $('.pre-load').addClass("fadeOut");
                }
            });
        }
    });

    $('#wikiModal').on('hidden.bs.modal', function (e) {
        $('.pre-load').removeClass("fadeOut");
    });

    $('#capitalModal').on('show.bs.modal', function () {
        $('.pre-load').removeClass("fadeOut");
        const capital = $('#capital').text().trim();

        if (capital) {
            $.ajax({
                url: `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(capital)}`,
                type: 'GET',
                dataType: 'json',
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
                    $('#capitalSummary').html('Failed to fetch Wikipedia information.');
                    $('#capitalTitle').html('Failed to fetch Wikipedia information.');
                    showToast("Capital info - server error", 4000, true);
                    $('.pre-load').addClass("fadeOut");
                }
            });
        }
    });

    $('#capitalModal').on('hidden.bs.modal', function (e) {
        $('.pre-load').removeClass("fadeOut");
    });
});
