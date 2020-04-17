ourlyAvailabilityGauge = null
meanDifferenceGauge = null
medianAvailabilityGauge = null
overallDQIGauge = null
$(document).ready(function() {
    var defaultSectors = {
        percents: true,
        ranges: [{
          color : "#8b0000",
          lo : 0,
          hi : 33
        },{
          color : "#ff8c00",
          lo : 34,
          hi : 66
        },{
          color : "#32cd32",
          lo : 67,
          hi : 100
        }]
    }
    var standardDeviationSectors = {
        percents: true,
        ranges: [{
          color : "#32cd32",
          lo : 0,
          hi : 33
        },{
          color : "#ff8c00",
          lo : 34,
          hi : 66
        },{
          color : "#8b0000",
          lo : 67,
          hi : 100
        }]
    }
    var diffSectors = {
        ranges: [{
          color : "#8b0000",
          lo : -10,
          hi : -5
        },{
          color : "#ffff00",
          lo : -4.99,
          hi : -1.49
        },{
          color : "#32cd32",
          lo : -1.5,
          hi : 1.5
        },{
          color : "#ffff00",
          lo : 1.51,
          hi : 4.99
        },{
          color : "#8b0000",
          lo : 5,
          hi : 10
        }]
    }
    var defaultPointerOpts = {
        toplength: 8,
        bottomlength: 10,
        bottomwidth: 6,
        color: '#8e8e93',
    }
    hourlyAvailabilityGauge = new JustGage({
        id: "hourly-availability-gauge",
        value: 0,
        min: 0,
        max: 10,
        pointer: true,
        decimals: true,
        label: "(m/s)",
        customSectors: standardDeviationSectors,
        pointerOptions: defaultPointerOpts
    });
    meanDifferenceGauge = new JustGage({
        id: "mean-diff-gauge",
        value: 0,
        min: -10,
        max: 10,
        pointer: true,
        fromZero: true,
        decimals: true,
        pointerOptions: defaultPointerOpts,
        customSectors: diffSectors,
        label: "(m/s)"
    });
    medianAvailabilityGauge = new JustGage({
        id: "median-height-availability-gauge",
        value: 0,
        min: 0,
        max: 100,
        pointer: true,
        donut: true,
        customSectors: defaultSectors,
        pointerOptions: defaultPointerOpts,
        label: "(%)"
    });
    overallDQIGauge = new JustGage({
        id: "overall-dq-gauge",
        value: 0,
        min: 0,
        max: 100,
        pointer: true,
        customSectors: defaultSectors,
        pointerOptions: defaultPointerOpts,
        label: "(%)"
    });
    NPN_DQD.initFunctions(false);
    $("#animate").on('click', function() {
        var daysIterator = NPN_DQD.daysAvailable[Symbol.iterator]();
        if ($(this).attr('alt') == 'off') {
            $(this).attr('alt', 'on')
            $(this).html('Pause Animation ||')
            timeout = setInterval(function() {
                var nextDay = daysIterator.next()
                if (nextDay.done) {
                    daysIterator = NPN_DQD.daysAvailable[Symbol.iterator]();
                    nextDay = daysIterator.next()
                }
                NPN_DQD.dashboard(nextDay.value, null)
            }, 1000);
        }
        else {
            clearTimeout(timeout)
            $(this).attr('alt', 'off')
            $(this).html('Start Animation |>')
        }
    });
});
