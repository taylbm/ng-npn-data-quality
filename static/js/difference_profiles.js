DIFFERENCE_API = "http://10.20.58.144:5000/difference"
SEQUENCE_IDX = 0;
$(document).ready(function() {
    numberOfDays = 15;
    var timeout;
    function getData(dateStr, instance) {
        //var alpha = all_days ? 0.1 : 0.6;
        var alpha = 0.6;
        $('#loaderGif').css("display", "block")
        var dateStr = dateStr.replace(/-/g, '')
        $.getJSON(DIFFERENCE_API + '?icao=' + NPN_DQD.icao + '&date=' + dateStr)
        .done(function(data){
            $('#loaderGif').css("display", "none")
            chart.options.title.text = NPN_DQD.icao + ' - ' + data['title']
            chart.data.datasets[0].data = data['all_obs']
            chart.data.datasets[0].backgroundColor = Chart.helpers.color('#4dc9f6').alpha(alpha).rgbString()
            chart.data.datasets[1].data = data['mean_obs']
            chart.data.datasets[2].data = data['std_obs']
            chart.update()
        })
        .fail(function(error){
            console.log(error)
            $('#loaderGif').css("display", "none")
        });
    }
    var ctx = $('#plotCanvas')
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
    var chart = new Chart(ctx, {
        type: 'scatter',
        data: data,
        options: options
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
    $('input[name="avg-period-radio"]').checkboxradio({icon:false});
    $('#selectDate').datepicker(datepickerOpts);
    $('#selectDate').datepicker('setDate', new Date());
    $('#nextDay').on('click', function() {
        console.log('ALL')
        //var idx = (SEQUENCE_IDX % (numberOfDays + 1))
        ///SEQUENCE_IDX += 1
        //getData(idx, false);
    });
});
