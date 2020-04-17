displayOptions = {'Speed': {'units': '(m/s)',
                       'ticks':[-20, 20]
                      },
             'Direction': {'units': '(deg)',
                           'ticks': [-180, 180]
                          }
           };
modelChart = null;
modelVariable = 'Speed'
function saveChart() {
    var image = modelChart.toBase64Image()
    var fname = modelChart.options.title.text + '.png'
    $('#saveModelChart').attr('href', image)
    $('#saveModelChart').attr('download', fname)
}

$(document).ready(function() {
    Chart.plugins.register({
      beforeDraw: function(chartInstance) {
        var ctx = chartInstance.chart.ctx;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
      }
    });
    var ctx = $('#modelPlotCanvas')
    var data = {
        datasets: [
        {
            label: 'All Differenced Interpolated Observations',
            data: [{}],
            backgroundColor: Chart.helpers.color('#4dc9f6').alpha(0.6).rgbString(),
        },
        {
            label: 'Mean of Differenced Interpolated Obs',
            data: [{}],
            backgroundColor: Chart.helpers.color('#ff0000').alpha(1).rgbString(),
            borderColor: 'black'
        },
        {
            label: 'Standard Deviation of Differenced Interpolated Obs',
            data: [{}],
            backgroundColor: Chart.helpers.color('#7fff00').alpha(1).rgbString(),
            borderColor: 'black'
        }
        ]
    }
    var options = {
        animation: {
            onComplete: saveChart
        },
        legend: {
            display: true,
        },
        title: {
            display: true,
            text: '',
            fontSize: 16
        },
        tooltips: {
            callbacks: {
                afterBody: function(tooltipItem) {
                    var tooltipIndex = tooltipItem[0].index
                    if (tooltipIndex <= 99)
                        return 'Sample Size:' + NPN_DQD.modelSampleSize[tooltipIndex]
                    else
                        return
                }
            }
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: NPN_DQD.userParams.modelVariable + ' Difference [HRRR - RAOB] ' + displayOptions[NPN_DQD.userParams.modelVariable]['units'],
                    fontSize: 14
                },
                ticks: {
                    min: displayOptions[NPN_DQD.userParams.modelVariable]['ticks'][0],
                    max: displayOptions[NPN_DQD.userParams.modelVariable]['ticks'][1]
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Height [MSL] (m)',
                    fontSize: 14
                },
                ticks: {
                    min: 0,
                    max: 10000
                }
            }]
        }
    }
    modelChart = new Chart(ctx, {
        type: 'scatter',
        data: data,
        options: options
    });
    $('#selectModelVariable').selectmenu({
        change: function() {
            NPN_DQD.modelVariable = $(this).val();
            NPN_DQD['model'](NPN_DQD.selectedDateStr, null)
            var modelVariable = NPN_DQD.userParams.modelVariable
            modelChart.options.scales.xAxes[0].ticks.min = displayOptions[modelVariable]['ticks'][0]
            modelChart.options.scales.xAxes[0].ticks.max = displayOptions[modelVariable]['ticks'][1]
            modelChart.options.scales.xAxes[0].scaleLabel.labelString = modelVariable + ' Difference [HRRR - RAOB] ' + displayOptions[modelVariable]['units']
            modelChart.update()

        }
    });
});
