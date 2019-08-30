differencesChart = null;
$(document).ready(function() {
    var ctx = $('#differencesPlotCanvas')
    var data = {
        datasets: [
        {
            label: 'All Matched Observations',
            data: [{}],
            backgroundColor: Chart.helpers.color('#4dc9f6').alpha(0.6).rgbString(),
        },
        {
            label: 'Mean of Matched Obs',
            data: [{}],
            backgroundColor: Chart.helpers.color('#ff0000').alpha(1).rgbString(),
            borderColor: 'black'
        },
        {
            label: 'Standard Deviation of Matched Obs',
            data: [{}],
            backgroundColor: Chart.helpers.color('#7fff00').alpha(1).rgbString(),
            borderColor: 'black'
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
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Speed Difference [HRRR - NPN] (m/s)',
                    fontSize: 14
                },
                ticks: {
                    min: -30,
                    max: 30
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Height [AGL] (m)',
                    fontSize: 14
                },
                ticks: {
                    min: 0,
                    max: 10000
                }
            }]
        }
    }
    differencesChart = new Chart(ctx, {
        type: 'scatter',
        data: data,
        options: options
    });
});
