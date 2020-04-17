DATA_OUTAGES_METADATA = "http://10.20.58.144:5000/data_outages_metadata"
DATA_OUTAGES = "http://10.20.58.144:5000/data_outages"
availabilityRaw = null;
availabilitySmoothed = null;
availabilityChart = null;
datesAvailable = null;
startDateStr = null;
selectedIcao = "ROCO"

function initSitesDates () {
    var sites = $.getJSON(DATA_OUTAGES_METADATA)
    sites.done(function(data) {
        sites = data["sites"]
        datesAvailable = data["dates"]
        var selectHTML = ''
        for (i in sites) {
            selectHTML += '<option id="select' + sites[i] + '" value="' + sites[i] + '">' + sites[i] + '</option>'
        }
        $('#selectSite').html(selectHTML)
    });
    sites.fail(function(error) {
        console.log(error)
    });
}

function checkIfAvailable (date) {
    dateStr = date.toISOString().split('T')[0]
    console.log(dateStr)
    console.log(datesAvailable[selectedIcao])
    dateBool = datesAvailable[selectedIcao].includes(dateStr)
    return [dateBool, "", null]
}

function setStartDate(dateStr, instance) {
    startDateStr = dateStr.replace(/-/g, '')
}

function loadData(dateStr, instance) {
    $('#loaderGif').css('display', 'block')
    var endDateStr = dateStr.replace(/-/g, '')
    $.getJSON(DATA_OUTAGES + '?icao=' + selectedIcao + '&startDate=' + startDateStr + '&endDate=' + endDateStr)
    .done(function(data) {
        $('#loaderGif').css('display', 'none')
        availabilityChart.data.datasets[0].data = data["sixmin"]
        availabilityChart.data.datasets[1].data = data["hourly"]
        availabilityChart.update()
    })
    .fail(function(error) {
        $('#loaderGif').css('display', 'none')
        console.log(error)
    });
}

$(document).ready(function() {
    initSitesDates()
    $('#selectSite').selectmenu({
        width: 100,
        change: function( event, data) {
            selectedIcao = $(this).val();
        }
    });
    var startDatepickerOpts = {
        dateFormat: 'yy-mm-dd',
        defaultDate: new Date(),
        setDate: new Date(),
        beforeShowDay: checkIfAvailable,
        onSelect: setStartDate
    }                                                           
    var endDatepickerOpts = {
        dateFormat: 'yy-mm-dd',
        defaultDate: new Date(),
        setDate: new Date(),
        beforeShowDay: checkIfAvailable,
        onSelect: loadData
    }
    $('#startDate').datepicker(startDatepickerOpts);
    $('#endDate').datepicker(endDatepickerOpts);
    var ctx = $('#trackPlotCanvas')
    var data = {
        datasets: [
        {
            label: '6-Minute Data Availability',
            data: [{}],
            backgroundColor: 'red'
        },
        {
            label: 'Hourly Data Availability',
            data: [{}],
            backgroundColor: 'blue'
        }
        ]
    }
    var options = {
        legend: {
            display: true,
        },
        title: {
            display: true,
            text: '',
            fontSize: 16
        },
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    unit: 'day'
                }
            }]
        }
    }
    availabilityChart = new Chart(ctx, {
        type: 'scatter',
        data: data,
        options: options
    });
});
