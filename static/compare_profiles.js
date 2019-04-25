COMPARE_API = "http://10.20.58.144:5000/compare"
SEQUENCE_IDX = 0
$(document).ready(function() {
    numberOfDays = 8;
    var timeout;
    function getData(idx) {
        $.getJSON(COMPARE_API + '?index=' + idx)
        .done(function(data){
            npnProfile.setData(data["npn"]);
            hrrrProfile.setData(data["hrrr"]);
        })
        .fail(function(error){
            console.log(error)
        });
    }
    npnProfile = new VerticalWindProfile.Profile("profilerCanvas", {
	height: 500,
	width: 1285,
	title: "Chart",
	exportEnabled: true,
	zoomEnabled: true,
	padding: 0,
	margin: 15,
	Y_Axis: {
		grid:{ interval: 1 }
	},
	X_Axis: {
		grid:{ interval: 60 }
	},
	dataUnits: {
		speed: {label: "kts", factor: 1.94384}
	}
    });
    hrrrProfile = new VerticalWindProfile.Profile("hrrrCanvas", {
        height: 500,
        width: 1285,
        title: "Chart",
        exportEnabled: true,
        zoomEnabled: true,
        padding: 0,
        margin: 15,
        Y_Axis: {
                grid:{ interval: 1 }
        },
        X_Axis: {
                grid:{ interval: 60 }
        },
        dataUnits: {
                speed: {label: "kts", factor: 1.94384}
        }
    });
    getData(0);
    SEQUENCE_IDX += 1;
    $("#animate").on('click', function() {
        console.log($(this).attr('alt'))
        if ($(this).attr('alt') == 'off') {
            $(this).attr('alt', 'on')
            $(this).html('Pause Animation ||')
            timeout = setInterval(function() {
                var idx = (SEQUENCE_IDX % (numberOfDays + 1))
                SEQUENCE_IDX += 1
                getData(idx);
            }, 1000);
        }
        else {
            clearTimeout(timeout)
            $(this).attr('alt', 'off')
            $(this).html('Start Animation |>')
        }
    });
    $("#nextDay").on('click', function() {
        var idx = (SEQUENCE_IDX % (numberOfDays + 1))
        SEQUENCE_IDX += 1
        getData(idx);
    });
});
