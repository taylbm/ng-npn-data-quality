#! /usr/bin/bash

ROOT=/home/btaylor/npn_data_quality/hrrr_ak/BUFR
GCLOUD_URL="https://storage.googleapis.com/high-resolution-rapid-refresh/hrrr."
WMO_IDS=( "703410" "702510" )
for id in "${WMO_IDS[@]}"
    do
    for day in $(seq 0 2);
        do utcDate=`date --date="${day} day ago" --utc "+%Y%m%d"`;
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
        for utcHour in $(seq -f "%02g" 0 3 21);
            do
                BUFR_FILE="${DAY_DIR}/bufr.${id}.${utcDate}${utcHour}";
                currentHour=`date --utc "+%H"`;
                if [ ! -f $BUFR_FILE ]; then
                    if [ "$utcHour" -le "$currentHour" ] || [ "$day" -gt "0" ]; then
                        echo "Downloading: ${BUFR_FILE}"
                        wget "${GCLOUD_URL}${utcDate}/alaska/hrrr.t${utcHour}z.bufrsnd.tar.ak.gz" -O - | tar -C "${DAY_DIR}" -xz ./bufr.${id}.${utcDate}${utcHour}
                    fi
                fi
        done;
    done;
done;
