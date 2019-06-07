DIFFERENCE_API = "http://10.20.58.144:5000/difference"
SEQUENCE_IDX = 0;
$(document).ready(function() {
    numberOfDays = 15;
    var timeout;
    function getData(idx, all_days) {
        var alpha = all_days ? 0.1 : 0.6;
        $('#loaderGif').css("display", "block")
        $.getJSON(DIFFERENCE_API + '?index=' + idx + '&all=' + all_days)
        .done(function(data){
            $('#loaderGif').css("display", "none")
            chart.options.title.text = 'ROCO2 - ' + data['title']
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
            label: 'Mean of Observations',
            data: [{}],
            backgroundColor: Chart.helpers.color('#ff0000').alpha(1).rgbString(),
            borderColor: 'black'
        },
        {
            label: 'Standard Deviation of Observations',
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
    getData(0, false);
    SEQUENCE_IDX += 1;
    $("#animate").on('click', function() {
        if ($(this).attr('alt') == 'off') {
            $(this).attr('alt', 'on')
            $(this).html('Pause Animation ||')
            timeout = setInterval(function() {
                var idx = (SEQUENCE_IDX % (numberOfDays + 1))
                SEQUENCE_IDX += 1
                getData(idx);
            }, 1000);
        }
        else {
            clearTimeout(timeout)
            $(this).attr('alt', 'off')
            $(this).html('Start Animation |>')
        }
    });
    console.log($('#nextDay'))
    $("#nextDay").on('click', function() {
        console.log('ALL')
        var idx = (SEQUENCE_IDX % (numberOfDays + 1))
        SEQUENCE_IDX += 1
        getData(idx, false);
    });
    $("#allDays").on('click', function() {
        getData(0, true);
    });

});
