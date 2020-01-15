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
});
