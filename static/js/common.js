var NPN_DQD = {
        
        ROCSTAR1_NPN_ENDPOINT: 'http://rocstar1/npn_api/',
        ROCSTAR2_NPN_ENDPOINT: 'http://rocstar2/npn_api/',
        COMPARE_ENDPOINT: "http://localhost:5000/compare",
        DIFFERENCE_ENDPOINT: "http://localhost:5000/difference",
        MODEL_ENDPOINT: "http://10.20.58.144:5000/model",
        AVAILABILITY_ENDPOINT: "http://10.20.58.144:5000/available",
        OVERVIEW_ENDPOINT: "http://10.20.58.144:5000/overview",
        XTRA_HGTS_DATES: ["2020-02-12", "2020-02-13", "2020-02-14", "2020-02-15", "2020-02-16", "2020-02-17", "2020-02-18", "2020-02-19"],
        AVERAGING_TABS: ['differences', 'availability', 'model'],
        SAMPLE_TABS: ['profiles', 'differences'],
        userParams: {
            npnDataSource: 'weather-gov',
            modelDataSource: 'hrrr',
            selectedDateStr: null,
            differenceVariable: 'Speed',
            modelVariable: 'Speed',
            modelOffsetHours: 0,
            qcStatus: 'off',
            hourly: 't',
            icao: 'roco2',
            avgPeriodHours: 24
        },
        differenceSampleSize: null,
        modelSampleSize: null,
        avgPeriod: {
            'oneDay': 24,
            'oneWeek': 7 * 24,
            'oneMonth': (365/12) * 24
        },
        plotDate: {
            profiles: null,
            differences: null,
            availability: null
        },
        daysAvailable: [],
        initDateList: function() {
            d = new Date;
            if (NPN_DQD.userParams.npnDataSource == "weather-gov") {
                var today = d.toISOString().split('T')[0]
                NPN_DQD.daysAvailable = [today]
                var selectHtml = '<option id="select-roco2" selected value="roco2">ROCO2</option>'
                selectHtml += '<option id="select-tlka2" value="tlka2">TLKA2</option>'
                selectHtml += '<option id="select-hwpa2" value="hwpa2">HWPA2</option>'
                $('#selectSite').html(selectHtml)
            }
            else {
                var sites = $.getJSON(NPN_DQD.ROCSTAR1_NPN_ENDPOINT + 'sites?format=json&t_=' + d.getTime())
                sites.done(function(data) {
                    var selectHtml = ''
                    for (i in data) {
                        selectHtml += '<option id="select' + data[i] + '" value="' + data[i] + '">' + data[i] + '</option>'
                        selectHtml += '<option id="select' + data[i] + '_xtrahtgs" value="' + data[i] + '_xtrahtgs">' + data[i] + '_Build4.1</option>'
                    }
                    $('#selectSite').html(selectHtml)
                });
                sites.fail(function(error) {
                    console.log(error)
                });
                sites.then(function(siteData) {
                    NPN_DQD.userParams.icao = siteData[0]
                    $.getJSON(NPN_DQD.PRIMARY_NPN_ENDPOINT + 'dates?icao=' + NPN_DQD.userParams.icao + '&format=json&t_=' + d.getTime())
                    .done(function(data) {
                        NPN_DQD.daysAvailable = data;
                    })
                    .fail(function(error) {
                        console.log(error)
                    });
                });
            }
        },
        getDates: function(icao) {
            d = new Date;
            if (icao == null || NPN_DQD.userParams.npnDataSource == 'weather-gov') {
                return
            }
            if (icao.includes("_")) {
                NPN_DQD.daysAvailable = NPN_DQD.XTRA_HGTS_DATES
            }
            else {
                $.getJSON(NPN_DQD.PRIMARY_NPN_ENDPOINT + 'dates?icao=' + icao + '&format=json&t_=' + d.getTime())
                .done(function(data) {
                    console.log(data)
                    NPN_DQD.daysAvailable = data;
                })
                .fail(function(error) {
                    alert("Error retrieving available dates: " + error.statusText)
                    console.log(error)
                });
            }
        },
        checkIfAvailable: function(date) {
            dateStr = date.toISOString().split('T')[0]
            dateBool = NPN_DQD.daysAvailable.includes(dateStr)
            dateBool = dateStr.includes("2017") ? true : dateBool
            return [dateBool, "", null]
        },
        profiles: function getData(dateStr, instance) {
            $('#loaderGif').css('display', 'block')
            var dateStr = dateStr.replace(/-/g, '')
            $.getJSON(NPN_DQD.COMPARE_ENDPOINT + '?userParamsDict=' + JSON.stringify(NPN_DQD.userParams))
            .done(function(data) {
                $('#loaderGif').css('display', 'none')
                hrrrProfile.setData(data['hrrr'])
                npnProfile.setData(data['npn'])
                hrrrProfile.render()
                npnProfile.render()
                $('#max-height').spinner("value", data['global_max_ht'])
            })
            .fail(function(error) {
                alert("Error retrieving profiles: " + error.statusText)
                $('#loaderGif').css('display', 'none')
                console.log(error)
            });
        },
        differences: function getData(dateStr, instance) {
            var alpha = 0.8
            $('#loaderGif').css('display', 'block')
            var dateStr = dateStr.replace(/-/g, '')
            $.getJSON(NPN_DQD.DIFFERENCE_ENDPOINT + '?userParamsDict=' + JSON.stringify(NPN_DQD.userParams))
            .done(function(data){
                $('#loaderGif').css('display', 'none')
                NPN_DQD.sampleSize = data['sample_size']
                var hourly = NPN_DQD.userParams.hourly == 't' ? ' (Hourly Data) ' : ' (Six-Minute Data) '
                var units = displayOptions[NPN_DQD.userParams.differenceVariable]['units']
                differencesChart.options.title.text = NPN_DQD.userParams.icao + ' - ' + data['title'] + 
                                                      hourly + data['all_obs'].length.toString() + ' data points / ' +
                                                      'overall mean: ' + Math.round(data['overall_mean'] * 100) / 100 + ' ' + units
                differencesChart.data.datasets[0].hidden = NPN_DQD.userParams.avgPeriodHours > 24
                differencesChart.data.datasets[0].data = data['all_obs']
                differencesChart.data.datasets[0].backgroundColor = Chart.helpers.color('#4dc9f6').alpha(alpha).rgbString()
                differencesChart.data.datasets[1].data = data['mean_obs']
                differencesChart.data.datasets[2].data = data['std_obs']
                differencesChart.options.scales.xAxes[0].scaleLabel.labelString = NPN_DQD.userParams.differenceVariable + ' Difference [' + 
                                                                                  NPN_DQD.userParams.modelDataSource.toUpperCase() + ' - NPN] ' +
                                                                                  units
                differencesChart.update()
            })
            .fail(function(error){
                alert("Error retrieving computed differences: " + error.statusText)
                console.log(error)
                $('#loaderGif').css("display", "none")
            });
        },
        model: function getData(dateStr, instance) {
            var alpha = 0.8
            $('#loaderGif').css('display', 'block')
            var dateStr = dateStr.replace(/-/g, '')
            $.getJSON(NPN_DQD.MODEL_ENDPOINT + '?icao=' + NPN_DQD.userParams.icao + '&date=' + dateStr + '&hours=' + NPN_DQD.avgPeriodHours + '&variable=' + NPN_DQD.modelVariable)
            .done(function(data){
                $('#loaderGif').css('display', 'none')
                NPN_DQD.modelSampleSize = data['sample_size']
                modelChart.options.title.text = NPN_DQD.userParams.icao + ' - ' + data['title']
                modelChart.data.datasets[0].hidden = NPN_DQD.avgPeriodHours > 24
                modelChart.data.datasets[0].data = data['all_obs']
                modelChart.data.datasets[0].backgroundColor = Chart.helpers.color('#4dc9f6').alpha(alpha).rgbString()
                modelChart.data.datasets[1].data = data['mean_obs']
                modelChart.data.datasets[2].data = data['std_obs']
                modelChart.update()
            })
            .fail(function(error){
                alert("Error retrieving model check: " + error.statusText)
                console.log(error)
                $('#loaderGif').css("display", "none")
            });
        },
        availability: function getData(dateStr, instance) {
            $('#loaderGif').css('display', 'block')
            var requestDateStr = dateStr.replace(/-/g, '')
            $.getJSON(NPN_DQD.AVAILABILITY_ENDPOINT + '?date=' + requestDateStr + '&icao=' + NPN_DQD.userParams.icao + '&hours=' + NPN_DQD.avgPeriodHours)
            .done(function(data){
                $('#loaderGif').css('display', 'none')
                availabilityChart.options.title.text = NPN_DQD.userParams.icao + ' - ' + data['title']
                availabilitySmooth = data['availability_smoothed']
                availabilityRaw = data['availability']
                availabilityChart.data.datasets[0].data = data['availability_smoothed']
                availabilityChart.data.datasets[1].data = data['availability']
                availabilityChart.update()
             })
             .fail(function(error){
                alert("Error retrieving height availability: " + error.statusText)
                 console.log(error)
                 $('#loaderGif').css('display', 'none')
             });
        },
        dashboard: function(dateStr, instance) {
            $('#loaderGif').css('display', 'block')
            var requestDateStr = dateStr.replace(/-/g, '')
            $.getJSON(NPN_DQD.OVERVIEW_ENDPOINT + '?icao=' + NPN_DQD.userParams.icao + '&date=' + requestDateStr + '&hours=' + NPN_DQD.avgPeriodHours)
            .done(function(data) {
                $('#loaderGif').css('display', 'none')
                $('#pageHeaderTitleDiv').html('NPN Data Quality - ' + dateStr)
                hourlyAvailabilityGauge.refresh(data['std_difference'])
                meanDifferenceGauge.refresh(data['mean_difference'])
                medianAvailabilityGauge.refresh(data['median_availability'])
                overallDQIGauge.refresh(data['overall_dqi'])
            })
            .fail(function(error) {
                $('#loaderGif').css('display', 'none')
                console.log(error)
            });
        },
        onSelectSwitch: function(dateStr, instance) {
            var activeTabIdx = $('#tabs').tabs('option', 'active')
            var tabName = $('#tabs li a')[activeTabIdx].id
            NPN_DQD.userParams.selectedDateStr = dateStr
            for (idx in NPN_DQD.plotDate) {
                NPN_DQD.plotDate[idx] = true
            }
            if (tabName == "profiles")
                NPN_DQD.profiles(dateStr, instance)
            else if (tabName == "differences")
                NPN_DQD.differences(dateStr, instance)
            else if (tabName == "model")
                NPN_DQD.model(dateStr, instance)
            else if (tabName == "availability")
                NPN_DQD.availability(dateStr, instance)
        },
        initFunctions: function(tabs) {
            NPN_DQD.initDateList()
            var viewSwitch = tabs ? NPN_DQD.onSelectSwitch : NPN_DQD.dashboard
            var datepickerOpts = {
                dateFormat: 'yy-mm-dd',
                defaultDate: new Date(),
                setDate: new Date(),
                beforeShowDay: NPN_DQD.checkIfAvailable,
                onSelect: viewSwitch
            }
            $('input[name="comparison-qc"]').click(function() {
                var activeTabIdx = $('#tabs').tabs('option', 'active')
                var tabName = $('#tabs li a')[activeTabIdx].id
                if ($('#comparison-qc-label').html() == "QC On") {
                    $('#comparison-qc-label').html("QC Off")
                    NPN_DQD.qcStatus = 'off'
                    NPN_DQD[tabName](NPN_DQD.userParams.selectedDateStr, null)
                }
                else if ($('#comparison-qc-label').html() == "QC Off") {
                    $('#comparison-qc-label').html("QC On")
                    NPN_DQD.qcStatus = 'on'
                    NPN_DQD[tabName](NPN_DQD.userParams.selectedDateStr, null)
                }
            });
            $('#selectDate').datepicker(datepickerOpts);
            $('#selectSite').selectmenu({
                width: 100,
                change: function( event, data) {
                    var selectedIcao = $(this).val();
                    NPN_DQD.userParams.icao = selectedIcao;
                    NPN_DQD.getDates(selectedIcao);
                }
            });
            $('input[name="avg-period-radio"]').checkboxradio({
                icon:false
            })
            .change(function(event, data) {
                NPN_DQD.userParams.avgPeriodHours = NPN_DQD.avgPeriod[$(this).attr('id')]
            });
            $('#' + NPN_DQD.userParams.npnDataSource).attr('checked', true)
            $('#' + NPN_DQD.userParams.modelDataSource).attr('checked', true)
            $('input[name="data-source"]').checkboxradio()
            .change(function(event, data) {
                NPN_DQD.userParams.npnDataSource = $(this).attr('id')
                NPN_DQD.initDateList()
            });
            $('input[name="model-data-source"]').checkboxradio()
            .change(function(event, data) {
                NPN_DQD.userParams.modelDataSource = $(this).attr('id')
                NPN_DQD.initDateList()
            });
            $('input[name="data-source"]').checkboxradio("refresh")
            $('#accordion').accordion({
                heightStyle: "content",
                active: 1
            });
            $('input[name="model-hour-offset"]').spinner({
                change: function(event, ui) {
                    var hours = $(this).val()
                    NPN_DQD.userParams.modelOffsetHours = hours
                }
            });
            if (tabs) {
                $('#tabs').tabs({
                    activate: function( event, ui ) {
                        var tabName = ui.newTab.context.id
                        var selectedDateStr = NPN_DQD.userParams.selectedDateStr
                        if (selectedDateStr && NPN_DQD.plotDate[tabName]) {
                            NPN_DQD[tabName](selectedDateStr, null)
                            NPN_DQD.plotDate[tabName] = false
                            if (NPN_DQD.SAMPLE_TABS.includes(tabName)) {
                                var timeStep = NPN_DQD.userParams.hourly == 't' ? '-hourly':'-6-min'
                                $("#" + tabName + timeStep).prop("checked", true)
                                $('input[name="sample-interval-radio-' + tabName + '"]').checkboxradio("refresh")
                            }
                        }
                        if (NPN_DQD.AVERAGING_TABS.includes(tabName)) {
                            $('#avgPeriod').css('display', 'inline-block')
                            $('#maxHeight').css('display', 'none')
                        }
                        else {
                            $('#avgPeriod').css('display', 'none')
                            $('#maxHeight').css('display', 'inline-block')
                        }
                    }
                });
            }
        }
}
