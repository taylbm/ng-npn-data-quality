#! /usr/bin/bash

#ROOT=/home/btaylor/npn_data_quality/hrrr_ak/BUFR
ROOT=/Volumes/BTAYLOR-32G/npn_data_quality/nam_ak/BUFR
NOMADS_URL="https://nomads.ncep.noaa.gov/pub/data/nccf/com/nam/prod/nam."
WMO_IDS=( "703410" "702510" )
for id in "${WMO_IDS[@]}"
    do
    for day in $(seq 0 2);
        # RHEL7 date command syntax
        do utcDate=`date --date="${day} day ago" --utc "+%Y%m%d"`;
        #Mac OS X date command syntax
        #do utcDate=`date -u -v -${day}d "+%Y%m%d"`;
        echo "$utcDate"
        SITE_DIR="${ROOT}/${id}"
        if [ ! -d $SITE_DIR ]; then
            mkdir $SITE_DIR
        fi
        DAY_DIR="${ROOT}/${id}/${utcDate}"
        if [ ! -d "$DAY_DIR" ]; then
            echo "Creating ${DAY_DIR}"
            mkdir $DAY_DIR
        fi
        for utcHour in $(seq -f "%02g" 0 6 18);
            do
                BUFR_FILE="${DAY_DIR}/bufr.${id}.${utcDate}${utcHour}";
                currentHour=`date -utc "+%H"`;
                if [ ! -s $BUFR_FILE ]; then
                    rm -f $BUFR_FILE;
                fi
                if [ ! -f $BUFR_FILE ]; then
                    if [ "$utcHour" -le "$currentHour" ] || [ "$day" -gt "0" ]; then
                        echo "Downloading: ${BUFR_FILE}"
                        wget "${NOMADS_URL}${utcDate}/bufr_alaskanest.t${utcHour}z/bufr.${id}.${utcDate}${utcHour}" -P $DAY_DIR;
                    fi
                fi
        done;
    done;
done;
