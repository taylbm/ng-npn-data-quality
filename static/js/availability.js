API_ROOT = "http://10.20.58.144:5000/";
SEQUENCE_IDX = 0;
AVAILABILITY_RAW = null;
AVAILABILITY_SMOOTHED = null;
$(document).ready(function() {
    numberOfDays = 15;
    var timeout;
    function getData(idx, all_days) {
        $('#loaderGif').css("display", "block")
        $.getJSON(API_ROOT + 'available' + '?index=' + idx + '&all=' + all_days)
        .done(function(data){
            $('#loaderGif').css("display", "none")
            chart.options.title.text = 'ROCO2 - ' + data['title']
            AVAILABILITY_RAW = data['availability']
            AVAILABILITY_SMOOTHED = data['availability_smoothed']
            chart.data.datasets[0].data = data['availability_smoothed']
            chart.data.datasets[1].data = data['availability']
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
                    labelString: 'Data Availability (%)',
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
                    labelString: 'Height [AGL] (m)',
                    fontSize: 14
                },
                ticks: {
                    min: 0,
                    max: 16000
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
    $('input[name="smoothed"]').change(function() {
        var checked = this.checked
        if (checked) {
            chart.data.datasets[0].data = AVAILABILITY_SMOOTHED
            
        }
        else {
            chart.data.datasets[0].data = [{}]
        }
        chart.update()
    });
    $('input[name="raw"]').change(function() {
        var checked = this.checked
        if (checked) {
            chart.data.datasets[1].data = AVAILABILITY_RAW

        }
        else {
            chart.data.datasets[1].data = [{}]
        }
        chart.update()
    });

});
