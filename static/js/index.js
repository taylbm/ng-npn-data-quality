COMPARE_API = 'http://10.20.58.144:5000/compare'
NPN_API = 'http://10.20.120.110/npn_api/'
daysAvailable = [];
icao = 'TLKA'

function initDateList() {
    d = new Date;
    var sites = $.getJSON(NPN_API + 'sites?format=json&t_=' + d.getTime())
    .done(function(data) {
        icao = data[0]
        var selectHTML = ''
        for (i in data) {
            selectHTML += '<option id="select' + data[i] + '" value="' + data[i] + '">' + data[i] + '</option>'
        }
        $('#selectSite').html(selectHTML)
    })
    .fail(function(error) {
        console.log(error)
    });
    var dates = sites.then(function(siteData) {
        $.getJSON(NPN_API + 'dates?icao=' + siteData[0] + '&format=json&t_=' + d.getTime())
        .done(function(dateData) {
            console.log(dateData)
            daysAvailable = dateData;
        })
        .fail(function(error) {
            console.log(error)
        });
    });
}


function getSites() {
    d = new Date;
    $.getJSON(NPN_API + 'sites?format=json&t_=' + d.getTime())
    .done(function(data) {
        var selectHTML = ''
        for (i in data) {
            selectHTML += '<option id="select' + data[i] + '" value="' + data[i] + '">' + data[i] + '</option>'
        }
        $('#selectSite').html(selectHTML)
    })
    .fail(function(error) {
        console.log(error)
    });
}

function getDates() {
    d = new Date;
    var selectedIcao = $('#selectSite').val()
    var requestIcao = selectedIcao == null ? icao : selectedIcao;
    $.getJSON(NPN_API + 'dates?icao=' + requestIcao + '&format=json&t_=' + d.getTime())
    .done(function(data) {
        daysAvailable = data;
    })
    .fail(function(error) {
        console.log(error)
    });
}

function checkIfAvailable(date) {
    dateStr = date.toISOString().split('T')[0]
    dateBool = daysAvailable.includes(dateStr)
    return [dateBool, "", null]
}

$(document).ready(function() {
    function getData(dateStr, instance) {
        var dateStr = dateStr.replace(/-/g, '')
        $.getJSON(COMPARE_API + '?icao=' + icao + '&date=' + dateStr)
        .done(function(data) {
            console.log(data)
            hrrrProfile.setData(data['hrrr'])
            npnProfile.setData(data['npn'])
        })
        .fail(function(error) {
            console.log(error)
        });
    }
    getSites();
    getDates();
    var datepickerOpts = {
        dateFormat: 'yy-mm-dd',
        defaultDate: new Date(),
        beforeShowDay: checkIfAvailable,
        onSelect: getData
    }
    $('#selectSite').change(function() {
        var selectedIcao = $(this).val();
        icao = selectedIcao;
    });
    $('#selectDate').datepicker(datepickerOpts);
    $('#selectDate').datepicker('setDate', new Date());
    $('#pageNavTabs').tabs();
    $('#selectSite').selectmenu();
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
    var gauge1 = new JustGage({
        id: "data-received-gauge",
        value: 19,
        min: 0,
        max: 24,
        donut: true,
        pointer: true,
        label: "Hours",
        customSectors: defaultSectors,
        pointerOptions: defaultPointerOpts
    });
    var gauge2 = new JustGage({
        id: "mean-diff-gauge",
        value: -2,
        min: -10,
        max: 10,
        pointer: true,
        fromZero: true,
        pointerOptions: defaultPointerOpts,
        customSectors: diffSectors,
        label: "(m/s)"
    });
    var gauge3 = new JustGage({
        id: "max-availability-gauge",
        value: 90,
        min: 0,
        max: 100,
        pointer: true,
        donut: true,
        customSectors: defaultSectors,
        pointerOptions: defaultPointerOpts,
        label: "(%)"
    });
    var gauge4 = new JustGage({
        id: "overall-dq-gauge",
        value: 95,
        min: 0,
        max: 100,
        pointer: true,
        customSectors: defaultSectors,
        pointerOptions: defaultPointerOpts,
        label: "(%)"
    });
});
