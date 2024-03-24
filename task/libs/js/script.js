$("#btnOne").click(function() {

    $.ajax({
        url: 'libs/php/getEarthquakes.php',
        type: 'POST',
        dataType: 'json',
        data: {
            north: $("#north").val(),
            south: $("#south").val(),
            east: $("#east").val(),
            west: $("#west").val()
        },
        success: function(result) {
            console.log(JSON.stringify(result));
            
            if (result.status.name == "ok") {
                    $('#datetime').html(result['data'][0]['datetime']);
                    $('#depth').html(result['data'][0]['depth']);
                    $('#lng').html(result['data'][0]['lng']);
                    $('#src').html(result['data'][0]['src']);
                    $('#eqid').html(result['data'][0]['eqid']);
                    $('#magnitude').html(result['data'][0]['magnitude']);
                    $('#lat').html(result['data'][0]['lat']);
        }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching data from the API:', errorThrown);
        }
    });
});

$("#btnTwo").click(function() {

    $.ajax({
        url: 'libs/php/getWeather.php',
        type: 'POST',
        dataType: 'json',
        data: {
            clouds: "",
            datetime: "yyyy-MM-dd",
            temperature: "",
            stationName: ""
        },
        success: function(result) {
            console.log(result);
            
            if (result.status.name == "ok") {
            $('#apiResults').html('<td colspan="3">' + result.data + '</td>');
        }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching data from the API:', errorThrown);
        }
    });
});

$("#btnThree").click(function() {

    $.ajax({
        url: 'libs/php/getTimezone.php',
        type: 'POST',
        dataType: 'json',
        data: {
            sunrise: "yyyy-MM-dd",
            sunset: "yyyy-MM-dd",
            countryName: "",
            time: "yyyy-MM-dd"
        },
        success: function(result) {
            console.log(result);
            
            if (result.status.name == "ok") {
            $('#apiResults').html('<td colspan="3">' + result.data + '</td>');
        }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching data from the API:', errorThrown);
        }
    });
});