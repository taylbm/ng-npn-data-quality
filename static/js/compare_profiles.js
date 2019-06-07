COMPARE_API = 'http://10.20.58.144:5000/compare'
NPN_API = 'http://10.20.120.110/npn_api/'
daysAvailable = [];
icao = 'TLKA'

function getSites() {
    d = new Date;
    $.getJSON(NPN_API + 'sites?format=json&t_=' + d.getTime())
    .done(function(data) {
        var selectHTML = ''
        for (i in data) {
            selectHTML += '<option id="select' + data[i] + '" value="' + data[i] + '">' + data[i] + '</option>'
        }
        $('#selectSite').html(selectHTML)
    })
    .fail(function(error) {
        console.log(error)
    });
}

function getDates() {
    d = new Date;
    var selectedIcao = $('#selectSite').val()
    var requestIcao = selectedIcao == null ? icao : selectedIcao;
    $.getJSON(NPN_API + 'dates?icao=' + requestIcao + '&format=json&t_=' + d.getTime())
    .done(function(data) {
        daysAvailable = data;
    })
    .fail(function(error) {
        console.log(error)
    });
}

function checkIfAvailable(date) {
    dateStr = date.toISOString().split('T')[0]
    dateBool = daysAvailable.includes(dateStr)
    return [dateBool, "", null]
}

$(document).ready(function() {
    npnProfile = new VerticalWindProfile.Profile("profilerCanvas", {
	height: 475,
	width: 1300,
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
        height: 475,
        width: 1300,
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
    function getData(dateStr, instance) {
        var dateStr = dateStr.replace(/-/g, '')
        $.getJSON(COMPARE_API + '?icao=' + icao + '&date=' + dateStr)
        .done(function(data) {
            console.log(data)
            hrrrProfile.setData(data['hrrr'])
            npnProfile.setData(data['npn'])
        })
        .fail(function(error) {
            console.log(error)
        });
    }

    getSites();
    getDates();
    var datepickerOpts = {
        dateFormat: 'yy-mm-dd',
        defaultDate: new Date(),
        beforeShowDay: checkIfAvailable,
        onSelect: getData
    }
    $('#selectSite').change(function() {
        var selectedIcao = $(this).val();
        icao = selectedIcao;
    });
    $('#selectDate').datepicker(datepickerOpts);
    $('#selectDate').datepicker('setDate', new Date());
});
