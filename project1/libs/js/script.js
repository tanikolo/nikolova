$("#btnOne").click(function() {

        $.ajax({
            url: 'libs/php/getEarthquakes.php',
            type: 'POST',
            dataType: 'json',
            data: {
                datetime: "yyyy-MM-dd",
                depth: "",
                src: "",
                magnitude: ""
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
