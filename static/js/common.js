var NPN_DQD = {
        
        PRIMARY_NPN_API: 'http://rocstar1/npn_api/',
        BACKUP_NPN_API: 'http://rocstar2/npn_api/',
        icao: null,
        daysAvailable: [],
        initDateList: function() {
            d = new Date;
            var sites = $.getJSON(NPN_DQD.PRIMARY_NPN_API + 'sites?format=json&t_=' + d.getTime())
            sites.done(function(data) {
                var selectHTML = ''
                for (i in data) {
                    selectHTML += '<option id="select' + data[i] + '" value="' + data[i] + '">' + data[i] + '</option>'
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
            $.getJSON(NPN_DQD.PRIMARY_NPN_API + 'dates?icao=' + icao + '&format=json&t_=' + d.getTime())
            .done(function(data) {
                NPN_DQD.daysAvailable = data;
            })
            .fail(function(error) {
                console.log(error)
            });
        },
        checkIfAvailable: function(date) {
            dateStr = date.toISOString().split('T')[0]
            dateBool = NPN_DQD.daysAvailable.includes(dateStr)
            return [dateBool, "", null]
        }
}
