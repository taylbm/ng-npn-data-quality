//{label: "kts", factor: 1.94384}
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
    $('input[name="sample-interval-radio"]').checkboxradio();
    $('input[name="sample-interval-radio"]').on("change", function(event) {
        var sampleInterval = $(this)[0].id
        if (sampleInterval == "hourly")
            NPN_DQD.hourly = "t"
        else
            NPN_DQD.hourly = "f"
        NPN_DQD.profiles(NPN_DQD.selectedDateStr, null)

    });
    setInterval(function() {
        NPN_DQD.profiles(NPN_DQD.selectedDateStr, null)
    }, 360000);
});
