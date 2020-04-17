displayOptions = {'Speed': {'units': '(m/s)',
                       'ticks':[-20, 20]
                      },
             'Direction': {'units': '(deg)',
                           'ticks': [-180, 180]
                          }
           };
differencesChart = null;
function saveDifferenceChart() {
    var image = differencesChart.toBase64Image()
    var fname = differencesChart.options.title.text + '.png'
    $('#saveDifferenceChart').attr('href', image)
    $('#saveDifferenceChart').attr('download', fname)
}

$(document).ready(function() {
    Chart.plugins.register({
      beforeDraw: function(chartInstance) {
        var ctx = chartInstance.chart.ctx;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
      }
    });
    var ctx = $('#differencesPlotCanvas')
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
            borderColor: 'black',
        },
        {
            label: 'Standard Deviation of Differenced Interpolated Obs',
            data: [{}],
            backgroundColor: Chart.helpers.color('#7fff00').alpha(1).rgbString(),
            borderColor: 'black',
        }
        ]
    }
    var options = {
        animation: {
            onComplete: saveDifferenceChart
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
                        return 'Sample Size:' + NPN_DQD.sampleSize[tooltipIndex]
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
                    labelString: NPN_DQD.userParams.differenceVariable + ' Difference [' + NPN_DQD.userParams.modelDataSource.toUpperCase() + 
                                 ' - NPN] ' + displayOptions[NPN_DQD.userParams.differenceVariable]['units'],
                    fontSize: 14
                },
                ticks: {
                    min: displayOptions[NPN_DQD.userParams.differenceVariable]['ticks'][0],
                    max: displayOptions[NPN_DQD.userParams.differenceVariable]['ticks'][1]
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
    differencesChart = new Chart(ctx, {
        type: 'scatter',
        data: data,
        options: options
    });
    $('input[name="sample-interval-radio-differences"]').checkboxradio();
    $('input[name="sample-interval-radio-differences"]').on("change", function() {
        var sampleInterval = $(this)[0].id
        if (sampleInterval == "differences-hourly")
            NPN_DQD.userParams.hourly = "t"
        else
            NPN_DQD.userParams.hourly = "f"
        NPN_DQD.differences(NPN_DQD.userParams.selectedDateStr, null)

    });
    $('#selectDifferenceVariable').selectmenu({
        change: function() {
            NPN_DQD.userParams.differenceVariable = $(this).val();
            NPN_DQD['differences'](NPN_DQD.userParams.selectedDateStr, null)
            var differenceVariable = NPN_DQD.userParams.differenceVariable
            differencesChart.options.scales.xAxes[0].ticks.min = displayOptions[differenceVariable]['ticks'][0]
            differencesChart.options.scales.xAxes[0].ticks.max = displayOptions[differenceVariable]['ticks'][1]
            differencesChart.options.scales.xAxes[0].scaleLabel.labelString = differenceVariable + ' Difference [' +
                                                                              NPN_DQD.userParams.modelDataSource.toUpperCase() +
                                                                              ' - NPN] ' + displayOptions[differenceVariable]['units']
            differencesChart.update()

        }
    });
0});
