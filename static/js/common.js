var NPN_DQD = {
        
        PRIMARY_NPN_API: 'http://rocstar2/npn_api/',
        BACKUP_NPN_API: 'http://rocstar1/npn_api/',
        COMPARE_API: "http://10.20.58.144:5000/compare",
        DIFFERENCE_API: "http://10.20.58.144:5000/difference",
        MODEL_API: "http://10.20.58.144:5000/model",
        AVAILABILITY_API: "http://10.20.58.144:5000/available",
        OVERVIEW_API: "http://10.20.58.144:5000/overview",
        //XTRA_HGTS_DATES: ["2019-09-04", "2019-09-05","2019-09-06","2019-09-07","2019-09-08","2019-09-09", "2019-09-10"],
        XTRA_HGTS_DATES: ["2019-09-16", "2019-09-17","2019-09-18","2019-09-19","2019-09-20","2019-09-21", "2019-09-22", "2019-09-23",
                          "2019-09-24", "2019-09-25","2019-09-26","2019-09-27","2019-09-28","2019-09-29", "2019-09-30"],
        selectedDateStr: null,
        differenceVariable: 'Speed',
        modelVariable: 'Speed',
        icao: null,
        avgPeriodHours: 24,
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
            var sites = $.getJSON(NPN_DQD.PRIMARY_NPN_API + 'sites?format=json&t_=' + d.getTime())
            sites.done(function(data) {
                var selectHTML = ''
                for (i in data) {
                    selectHTML += '<option id="select' + data[i] + '" value="' + data[i] + '">' + data[i] + '</option>'
                    selectHTML += '<option id="select' + data[i] + '_xtrahtgs" value="' + data[i] + '_xtrahtgs">' + data[i] + '_xtrahgts</option>'
                }
                $('#selectSite').html(selectHTML)
            });
            sites.fail(function(error) {
                console.log(error)
            });
            sites.then(function(siteData) {
                NPN_DQD.icao = siteData[0]
                $.getJSON(NPN_DQD.PRIMARY_NPN_API + 'dates?icao=' + NPN_DQD.icao + '&format=json&t_=' + d.getTime())
                .done(function(data) {
                    NPN_DQD.daysAvailable = data;
                })
                .fail(function(error) {
                    console.log(error)
                });
            });
        },
        getDates: function(icao) {
            d = new Date;
            if (icao == null) {
                return
            }
            if (icao.includes("_")) {
                NPN_DQD.daysAvailable = NPN_DQD.XTRA_HGTS_DATES
            }
            else {
            $.getJSON(NPN_DQD.PRIMARY_NPN_API + 'dates?icao=' + icao + '&format=json&t_=' + d.getTime())
            .done(function(data) {
                console.log(data)
                NPN_DQD.daysAvailable = data;
            })
            .fail(function(error) {
                console.log(error)
            });
            }
        },
        checkIfAvailable: function(date) {
            dateStr = date.toISOString().split('T')[0]
            dateBool = NPN_DQD.daysAvailable.includes(dateStr)
            return [dateBool, "", null]
        },
        profiles: function getData(dateStr, instance) {
            $('#loaderGif').css('display', 'block')
            var dateStr = dateStr.replace(/-/g, '')
            $.getJSON(NPN_DQD.COMPARE_API + '?icao=' + NPN_DQD.icao + '&date=' + dateStr)
            .done(function(data) {
                console.log(data)
                $('#loaderGif').css('display', 'none')
                hrrrProfile.setData(data['hrrr'])
                npnProfile.setData(data['npn'])
            })
            .fail(function(error) {
                $('#loaderGif').css('display', 'none')
                console.log(error)
            });
        },
        differences: function getData(dateStr, instance) {
            var alpha = 0.8
            $('#loaderGif').css('display', 'block')
            var dateStr = dateStr.replace(/-/g, '')
            $.getJSON(NPN_DQD.DIFFERENCE_API + '?icao=' + NPN_DQD.icao + '&date=' + dateStr + '&hours=' + NPN_DQD.avgPeriodHours + '&variable=' + NPN_DQD.differenceVariable)
            .done(function(data){
                $('#loaderGif').css('display', 'none')
                NPN_DQD.sampleSize = data['sample_size']
                differencesChart.options.title.text = NPN_DQD.icao + ' - ' + data['title']
                differencesChart.data.datasets[0].hidden = NPN_DQD.avgPeriodHours > 24
                differencesChart.data.datasets[0].data = data['all_obs']
                differencesChart.data.datasets[0].backgroundColor = Chart.helpers.color('#4dc9f6').alpha(alpha).rgbString()
                differencesChart.data.datasets[1].data = data['mean_obs']
                differencesChart.data.datasets[2].data = data['std_obs']
                differencesChart.update()
            })
            .fail(function(error){
                console.log(error)
                $('#loaderGif').css("display", "none")
            });
        },
        model: function getData(dateStr, instance) {
            var alpha = 0.8
            $('#loaderGif').css('display', 'block')
            var dateStr = dateStr.replace(/-/g, '')
            $.getJSON(NPN_DQD.MODEL_API + '?icao=' + NPN_DQD.icao + '&date=' + dateStr + '&hours=' + NPN_DQD.avgPeriodHours + '&variable=' + NPN_DQD.modelVariable)
            .done(function(data){
                $('#loaderGif').css('display', 'none')
                NPN_DQD.modelSampleSize = data['sample_size']
                modelChart.options.title.text = NPN_DQD.icao + ' - ' + data['title']
                modelChart.data.datasets[0].hidden = NPN_DQD.avgPeriodHours > 24
                modelChart.data.datasets[0].data = data['all_obs']
                modelChart.data.datasets[0].backgroundColor = Chart.helpers.color('#4dc9f6').alpha(alpha).rgbString()
                modelChart.data.datasets[1].data = data['mean_obs']
                modelChart.data.datasets[2].data = data['std_obs']
                modelChart.update()
            })
            .fail(function(error){
                console.log(error)
                $('#loaderGif').css("display", "none")
            });
        },
        availability: function getData(dateStr, instance) {
            $('#loaderGif').css('display', 'block')
            var requestDateStr = dateStr.replace(/-/g, '')
            $.getJSON(NPN_DQD.AVAILABILITY_API + '?date=' + requestDateStr + '&icao=' + NPN_DQD.icao + '&hours=' + NPN_DQD.avgPeriodHours)
            .done(function(data){
                $('#loaderGif').css('display', 'none')
                availabilityChart.options.title.text = NPN_DQD.icao + ' - ' + data['title']
                availabilitySmooth = data['availability_smoothed']
                availabilityRaw = data['availability']
                availabilityChart.data.datasets[0].data = data['availability_smoothed']
                availabilityChart.data.datasets[1].data = data['availability']
                availabilityChart.update()
             })
             .fail(function(error){
                 console.log(error)
                 $('#loaderGif').css('display', 'none')
             });
        },
        dashboard: function(dateStr, instance) {
            $('#loaderGif').css('display', 'block')
            var requestDateStr = dateStr.replace(/-/g, '')
            $.getJSON(NPN_DQD.OVERVIEW_API + '?icao=' + NPN_DQD.icao + '&date=' + requestDateStr + '&hours=' + NPN_DQD.avgPeriodHours)
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
            NPN_DQD.selectedDateStr = dateStr
            for (idx in NPN_DQD.plotDate) {
                NPN_DQD.plotDate[idx] = true
            }
            NPN_DQD[tabName](dateStr, instance)
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
            $('#selectDate').datepicker(datepickerOpts);
            $('#selectSite').selectmenu({
                width: 100,
                change: function( event, data) {
                    var selectedIcao = $(this).val();
                    NPN_DQD.icao = selectedIcao;
                    NPN_DQD.getDates(selectedIcao);
                }
            });
            $('input[name="avg-period-radio"]').checkboxradio({
                icon:false
            })
            .change(function(event, data) {
                NPN_DQD.avgPeriodHours = NPN_DQD.avgPeriod[$(this).attr('id')]
            });
            if (tabs) {
                $('#tabs').tabs({
                    activate: function( event, ui ) {
                        var tabName = ui.newTab.context.id
                        var avgTabs = ['differences', 'availability', 'model']
                        if (NPN_DQD.selectedDateStr && NPN_DQD.plotDate[tabName]) {
                            NPN_DQD[tabName](NPN_DQD.selectedDateStr, null)
                            NPN_DQD.plotDate[tabName] = false
                        }
                        if (avgTabs.includes(tabName)) {
                            $('#avgPeriod').css('display', 'inline-block')
                        }
                        else {
                            $('#avgPeriod').css('display', 'none')
                        }
                    }
                });
            }
        }
}
