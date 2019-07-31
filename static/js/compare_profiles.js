COMPARE_API = 'http://10.20.58.144:5000/compare'
function getData(dateStr, instance) {
    var dateStr = dateStr.replace(/-/g, '')
    $.getJSON(COMPARE_API + '?icao=' + NPN_DQD.icao + '&date=' + dateStr)
    .done(function(data) {
        console.log(data)
        hrrrProfile.setData(data['hrrr'])
        npnProfile.setData(data['npn'])
    })
    .fail(function(error) {
        console.log(error)
    });
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
    NPN_DQD.initDateList()
    var datepickerOpts = {
        dateFormat: 'yy-mm-dd',
        defaultDate: new Date(),
        beforeShowDay: NPN_DQD.checkIfAvailable,
        onSelect: getData
    }
    $('#selectSite').change(function() {
        var selectedIcao = $(this).val();
        NPN_DQD.icao = selectedIcao;
        NPN_DQD.getDates(selectedIcao);
    });
    $('#selectSite').selectmenu();
    $('#selectDate').datepicker(datepickerOpts);
    $('#selectDate').datepicker('setDate', new Date());
});
