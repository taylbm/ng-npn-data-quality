//{label: "kts", factor: 1.94384}
var autoUpdateTimer;
function autoUpdate(auto) {
    if (auto) {
        autoUpdateTimer = setInterval(function() {
            NPN_DQD.profiles(NPN_DQD.selectedDateStr, null)
        }, 360000);
    }
    else {
        clearInterval(autoUpdateTimer)
    }
}
$(document).ready(function() {
    npnProfile = new VerticalWindProfile.Profile("profilerCanvas", {
	height: 475,
	width: 1280,
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
		speed: {label: "mps", factor: 1}
	}
    });
    hrrrProfile = new VerticalWindProfile.Profile("hrrrCanvas", {
        height: 475,
        width: 1280,
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
                speed: {label: "mps", factor: 1}
        }
    });
    NPN_DQD.initFunctions(true)
    $('#setMaxHeight').button().click(function()
    {
        var maxHeight = $('#max-height').spinner("value")
        npnProfile.setMaxMinHeight(0, maxHeight, true)
        hrrrProfile.setMaxMinHeight(0, maxHeight, true)
    });
    $('#max-height').spinner();
    $('input[name="sample-interval-radio-compare"]').checkboxradio();
    $('input[name="sample-interval-radio-compare"]').on("change", function() {
        var sampleInterval = $(this)[0].id
        if (sampleInterval == "compare-hourly")
            NPN_DQD.hourly = "t"
        else
            NPN_DQD.hourly = "f"
        NPN_DQD.profiles(NPN_DQD.selectedDateStr, null)

    });
    $('input[name="auto-update"]').on("change", function() {
        if ($('#auto-update-label').html() == "Auto-Update: Off") {
            autoUpdate(true)
            $('#auto-update-label').html("Auto-Update: On")
        }
        else {
            autoUpdate(false)
            $('#auto-update-label').html("Auto-Update: Off")
        }
    });
});
