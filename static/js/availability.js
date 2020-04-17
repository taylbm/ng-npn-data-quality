availabilityRaw = null;
availabilitySmoothed = null;
availabilityChart = null;
$(document).ready(function() {
    var ctx = $('#availabilityPlotCanvas')
    var data = {
        datasets: [
        {
            label: 'Smoothed Data Availability',
            data: [{}],
            backgroundColor: Chart.helpers.color('#4dc9f6').alpha(0.6).rgbString(),
            showLine: true
        },
        {
            label: 'Raw Data Availability',
            data: [{}],
            backgroundColor: Chart.helpers.color('#ff0000').alpha(0.6).rgbString(),
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
                    labelString: 'Height Availability (%)',
                    fontSize: 14
                },
                ticks: {
                    min: 0,
                    max: 1
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Height [MSL] (m)',
                    fontSize: 14
                }
            }]
        }
    }
    availabilityChart = new Chart(ctx, {
        type: 'scatter',
        data: data,
        options: options
    });
    $('input[name="smoothed"]').change(function() {
        var checked = this.checked
        if (checked) {
            availabilityChart.data.datasets[0].data = AVAILABILITY_SMOOTHED
            
        }
        else {
            availabilityChart.data.datasets[0].data = [{}]
        }
        availabilityChart.update()
    });
    $('input[name="raw"]').change(function() {
        var checked = this.checked
        if (checked) {
            availabilityChart.data.datasets[1].data = AVAILABILITY_RAW

        }
        else {
            availabilityChart.data.datasets[1].data = [{}]
        }
        availabilityChart.update()
    });
});
