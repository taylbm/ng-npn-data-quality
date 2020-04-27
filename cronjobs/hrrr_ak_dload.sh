#! /usr/bin/bash

DAYS=${1:-2}
ROOT=/home/btaylor/npn_data_quality/hrrr_ak/BUFR
# HRRR data comes from Google Cloud because sometimes NOMADS is missing files,
# and will be backfilled.
GCLOUD_URL="https://storage.googleapis.com/high-resolution-rapid-refresh/hrrr."
# dictionary mapping WMO IDS to ICAOs is in config.json
WMO_IDS=( "703410" "702510" )
for id in "${WMO_IDS[@]}"
    do
    for day in $(seq 0 $DAYS);
        do utcDate=`date --date="${day} day ago" --utc "+%Y%m%d"`;
        echo "$utcDate"
        # create site directory if it doesn't exist
        SITE_DIR="${ROOT}/${id}"
        if [ ! -d $SITE_DIR ]; then
            mkdir $SITE_DIR
        fi
        # create day directory if it doesn't exists
        DAY_DIR="${ROOT}/${id}/${utcDate}"
        if [ ! -d "$DAY_DIR" ]; then
            echo "Creating ${DAY_DIR}"
            mkdir $DAY_DIR
        fi
        for utcHour in $(seq -f "%02g" 0 3 21);
            do
                BUFR_FILE="${DAY_DIR}/bufr.${id}.${utcDate}${utcHour}";
                currentHour=`date --utc "+%H"`;
                # check if file exists
                if [ ! -f $BUFR_FILE ]; then
                    if [ "$utcHour" -le "$currentHour" ] || [ "$day" -gt "0" ]; then
                        echo "Downloading: ${BUFR_FILE}"
                        # Downloads .gz archive and pipes to tar command to extract the site files/hours we need
                        wget "${GCLOUD_URL}${utcDate}/alaska/hrrr.t${utcHour}z.bufrsnd.tar.ak.gz" -O - | tar -C "${DAY_DIR}" -xz ./bufr.${id}.${utcDate}${utcHour}
                    fi
                fi
        done;
    done;
done;
