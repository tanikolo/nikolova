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
        url: 'libs/php/getOceans.php',
        type: 'POST',
        dataType: 'json',
        data: {
            latitude: $("#oceanLat").val(),
            longitude: $("#oceanLng").val()
        },
        success: function(result) {
            console.log(JSON.stringify(result));
            
            if (result.status.name == "ok") {
                    $('#geonameId').html(result['data']['geonameId']);
                    $('#name').html(result['data']['name']);
                    $('#distance').html(result['data']['distance']);
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
            latitude: $("#timezoneLat").val(),
            longitude: $("#timezoneLng").val()
        },
        success: function(result) {
            console.log(JSON.stringify(result));
            
            if (result.status.name == "ok") {
                    $('#sunrise').html(result['data']['sunrise']);
                    $('#sunset').html(result['data']['sunset']);
                    $('#countryName').html(result['data']['countryName']);
                    $('#time').html(result['data']['time']);
        }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching data from the API:', errorThrown);
        }
    });
});