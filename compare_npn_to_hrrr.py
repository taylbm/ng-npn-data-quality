"""
Filename: compare_npn_to_hrrr.py

Purpose: Reads and parses NGNPN CSV data and HRRR model anaylsis BUFR soundings

Author: Brandon Taylor

Date: 20190411

Last Modified: 20200310

"""
import csv, os, json
import requests, time
from collections import defaultdict, OrderedDict
from logging.config import dictConfig
from datetime import datetime, timedelta
import numpy as np
from scipy.ndimage import gaussian_filter1d
from flask import Flask, request
from flask_cors import CORS
import ncepbufr
import sqlite3

import profiler_metr

APP = Flask(__name__)
CORS(APP)

with open('config.json', 'r') as jsfile:
    CONFIG = json.load(jsfile)

dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {'file_handler': {
        'class': 'logging.handlers.RotatingFileHandler',
        'formatter': 'default',
        'filename': CONFIG["LOG_FILE"],
        'level': 'DEBUG'
    }},
    'root': {
        'level': 'DEBUG',
        'handlers': ['file_handler']
    }
})

def connect_db():
    """
    Create a connection to the SQLite database.
    Arguments:
    @return {obj} - sqlite3 connection object.
    """
    try:
        conn = sqlite3.connect(CONFIG["DB_FNAME"], detect_types=sqlite3.PARSE_DECLTYPES|sqlite3.PARSE_COLNAMES)
    except sqlite3.Error:
        conn = None
    return conn

def sqlite_date_parse(date):
    """
    Returns a data in hyphenated format for SQLite purposes.
    Example: input 20200101, output 2020-01-01
    """
    return "{}-{}-{}".format(date[:4], date[4:6], date[6:])

def generate_expected_dates(start_date_str, end_date_str, hourly):
    """
    Generates expected dates for data outage tracking purposes.
    """
    start_date = datetime.strptime(start_date_str, '%Y%m%d')
    end_date = datetime.strptime(end_date_str, '%Y%m%d')
    if hourly:
        for day in range(int ((end_date - start_date).days) + 1):
            for hour in range(23):
                yield start_date + timedelta(days=day, hours=hour)
    else:
        for day in range(int ((end_date - start_date).days) + 1):
            for six_minutes in range(240):
                yield start_date + timedelta(days=day, seconds=six_minutes*360)

def read_b3_bufr(fname):
    """
    Reads NPN Build 3 style BUFR files.
    Extracts and converts height and wind speed/direction.
    """
    file_exists = os.path.isfile(fname)
    if file_exists:
        with open(fname, 'r') as text_file:
            try:
                raw_data = text_file.readlines()
                elevation = float([line.split('=')[1] for line in raw_data if 'heightOfStation' in line][0])
                height = [float(line.split('=')[1]) + elevation if 'MISSING' not in line else np.nan for line in raw_data if 'heightAboveStation' in line]
                speed = [float(line.split('=')[1]) if 'MISSING' not in line else np.nan for line in raw_data if 'windSpeed' in line]
                direction = [float(line.split('=')[1]) if 'MISSING' not in line else np.nan for line in raw_data if 'windDirection' in line]
                return zip(height, speed, direction)
            except csv.Error as err:
                print 'file %s, line %d: %s' % (fname, reader.line_num, err)
                APP.logger.exception(err)
                return zip([0], [0], [0])
    else:
        file_not_found = 'File not found: %s' % fname
        APP.logger.debug(file_not_found)
        return zip([0], [0], [0])


def read_ncep_bufr(fname, convert_uv):
    """
    Reads NCEP BUFR type files,
    which include the local table as the first message.
    Extracts and converts height and wind speed/direction.
    """
    data_exists = False
    empty_array = (np.zeros((3,)), np.zeros((3,)), np.zeros((3,)))
    if '2017' in fname:
        return empty_array
    try:
        bufr = ncepbufr.open(fname)
        while bufr.advance() == 0:
            while bufr.load_subset() == 0:
                elev = bufr.read_subset('GELV')[0][0]
                ftim = bufr.read_subset('FTIM')[0][0]
                if ftim == 0.:
                    data_exists = True
                    pressure_pa = bufr.read_subset('PRES')[0]
                    u_wind = bufr.read_subset('UWND')[0]
                    v_wind = bufr.read_subset('VWND')[0]
                    temperature = bufr.read_subset('TMDB')[0]
                    specific_humidity = bufr.read_subset('SPFH')[0]
        if not data_exists:
            pressure_pa = np.zeros((50,))
            u_wind = np.zeros((50,)) 
            v_wind = np.zeros((50,))
            temperature = np.zeros((50,))
            specific_humidity = np.zeros((50,))
            elev = 0.
        bufr.close()
        pressure_hpa = pressure_pa / 100.
        height_standard = np.rint(profiler_metr.pressure_to_height(pressure_hpa, elev))
        height_hyps = profiler_metr.hypsometric(specific_humidity, temperature, pressure_hpa, elev)
        if convert_uv:
            direction = np.around(profiler_metr.wind_direction(u_wind, v_wind), decimals=1)
            speed = np.around(profiler_metr.wind_speed(u_wind, v_wind), decimals=2)
            return zip(height_hyps, speed, direction)
        else:
            return (height_hyps, u_wind, v_wind)
    except IOError as err:
        print 'IO error reading NCEP BUFR file %s, skipping for now' % err
        APP.logger.exception(err)
        return empty_array
    except IndexError as err:
        print 'Index error while reading NCEP BUFR file %s, skipping for now' % err
        APP.logger.exception(err)
        return empty_array
    except Exception as err:
        print 'Unknown error: %s, skipping' % err
        APP.logger.exception(err)
        return empty_array

def read_npn_csv(fname):
    """
    Reads NGNPN CSV files.
    Extracts and converts height and wind speed/direction.
    """
    file_exists = os.path.isfile(fname)
    if file_exists:
        with open(fname, 'rb') as csv_file_obj:
            try:
                reader = csv.reader(csv_file_obj)
                raw_data = [row for row in reader]
                elevation = float(raw_data[7][2])
                data = [row for row in raw_data if len(row) == 7][1:]
                height = [float(data_point[0]) + elevation for data_point in data]
                speed = [float(data_point[3]) for data_point in data]
                direction = [float(data_point[2]) for data_point in data]
                return zip(height, speed, direction)
            except csv.Error as err:
                print 'file %s, line %d: %s' % (fname, reader.line_num, err)
                APP.logger.exception(err)
                return zip([0], [0], [0])
    else:
        file_not_found = 'File not found: %s' % fname
        APP.logger.debug(file_not_found)
        return zip([0], [0], [0])

def calc_min_max(npn_heights, hrrr_heights):
    """
    Calculates the height bounds across a time-series
    """
    try:
        npn_max_height = npn_heights.max()
        npn_min_height = npn_heights.min()
        hrrr_max_height = hrrr_heights.max()
        hrrr_min_height = hrrr_heights.min()
        global_max_height_1 = min(npn_max_height, hrrr_max_height)
        global_max_height = global_max_height_1 if global_max_height_1 > 0 else 1e4
        global_min_height = max(npn_min_height, hrrr_min_height)
        return (global_max_height, global_min_height)
    except:
        return (1e4, 0)

def high_mode_qc(npn_hourly_data, mean_max_height):
    npn_hourly_data_qc = []
    timestep_qc_flag = False
    adj_mean_max_height = mean_max_height - 2000.
    for idx, level in enumerate(npn_hourly_data):
        if level["HT"] > adj_mean_max_height and level["SPD"] < 5.144:
            timestep_qc_flag = True
            pass
        elif np.abs(level["HT"] - npn_hourly_data[idx - 1]["HT"]) > 2000 and idx > 1 and level["SPD"] < 12.86:
            timestep_qc_flag = True
            pass
        elif timestep_qc_flag and level["HT"] > adj_mean_max_height:
            pass
        else:
            npn_hourly_data_qc.append(level)
    return npn_hourly_data_qc

def retrieve_hrrr_winds(date, hour, icao, convert_uv=False):
    """
    Reads in hrrr bufr sounding from local archive
    """
    icao = icao.split('_')[0]
    wmo_id = CONFIG["WMO_SITE_IDS"][icao]
    hrrr_fname = 'bufr.' + wmo_id + '.' + date + hour
    data_dir = CONFIG["CONUS_DATA_DIR"] if icao == 'ROCO' else CONFIG["AK_DATA_DIR"]
    hrrr_fpath = os.path.join(data_dir, wmo_id, date, hrrr_fname)
    hrrr_data = read_ncep_bufr(hrrr_fpath, convert_uv)
    return hrrr_data

def extra_heights(date, icao, hours, hourly):
    """
    Tests the extra heights algorithmn
    """
    npn_out = []
    if hourly == 't':
        for hour in range(hours):
            init_datetime = datetime.strptime(date + '23', '%Y%m%d%H')
            hour_datetime = init_datetime - timedelta(hours=hour)
            epoch_timestamp = (hour_datetime - datetime(1970, 1, 1)).total_seconds()
            date_str = hour_datetime.strftime('%Y%m%d%H')
            npn_fname = os.path.join(CONFIG["XTRA_DATA_DIR"], icao.split('_')[0].lower() + '2', icao.split('_')[0] + '2' + '-' +
                                 date_str + '0000.npn.hrlywind.csv')
            npn_data_zipped = read_npn_csv(npn_fname)
            npn_data = [{"SPD": speed, "DIR": direction,
                         "HT": height}
                        for height, speed, direction in npn_data_zipped
                        if speed < 999]
            npn_out.append({"hourly": "t", "site-id": icao,
                            "min_ht": 1e2, "timestamp": epoch_timestamp,
                            "ICAO": icao, "max_ht": 1e4,
                            "data": npn_data})
    else:
        for six_minutes in range(hours * 10):
            init_datetime = datetime.strptime(date + '2354', '%Y%m%d%H%M')
            hour_datetime = init_datetime - timedelta(minutes=six_minutes * 6)
            epoch_timestamp = (hour_datetime - datetime(1970, 1, 1)).total_seconds()
            date_str = hour_datetime.strftime('%Y%m%d%H%M')
            npn_fname = os.path.join(CONFIG["XTRA_DATA_DIR"], icao.split('_')[0].lower() + '2', icao.split('_')[0] + '2' + '-' +
                                 date_str + '00.npn.6minwind.csv')
            npn_data_zipped = read_npn_csv(npn_fname)
            npn_data = [{"SPD": speed, "DIR": direction,
                         "HT": height}
                        for height, speed, direction in npn_data_zipped
                        if speed < 999]
            npn_out.append({"hourly": "f", "site-id": icao,
                            "min_ht": 1e2, "timestamp": epoch_timestamp,
                            "ICAO": icao, "max_ht": 1e4,
                            "data": npn_data})
    return npn_out

def extra_B3(date, icao, hours):
    """
    reads Build 3 data from 2017
    """
    npn_out = []
    for hour in range(hours):
        init_datetime = datetime.strptime(date + '23', '%Y%m%d%H')
        hour_datetime = init_datetime - timedelta(hours=hour)
        epoch_timestamp = (hour_datetime - datetime(1970, 1, 1)).total_seconds()
        year_str = hour_datetime.strftime('%Y')
        hour_str = hour_datetime.strftime('%H')
        time_tuple = hour_datetime.timetuple()
        jday = str(time_tuple.tm_yday)
        npn_fname = os.path.join(CONFIG["XTRA_DATA_DIR"], icao.split('_')[0].lower() + '2', year_str + jday + hour_str +
                                 '00_3600_' + icao.split('_')[0].lower() + '2' + '.bufr')
        npn_data_zipped = read_b3_bufr(npn_fname)
        npn_data = [{"SPD": speed, "DIR": direction,
                     "HT": height}
                    for height, speed, direction in npn_data_zipped
                    if speed < 999]
        npn_out.append({"hourly": "t", "site-id": icao,
                        "min_ht": 1e2, "timestamp": epoch_timestamp,
                        "ICAO": icao, "max_ht": 1e4,
                        "data": npn_data})
    return npn_out

         
def retrieve_npn_winds(date, icao, hourly='t', hours=24):
    """
    Reads in npn data from ROCSTAR.
    Tries the primary ROCSTAR server first with timeout,
    then tries the backup ROCSTAR server.
    """
    if len(icao.split('_')) > 1:
        return extra_heights(date, icao, hours, hourly)
    else:
        timeout = hours / 10.
        winds = 'winds?hourly=' + hourly + '&hours=' + str(hours) + '&enddate=' + date + '2359&icao=' + icao
        try:
            primary_request = requests.get(CONFIG["PRIMARY_NPN_API"] + winds, timeout=timeout)
            return primary_request.json()
        except requests.exceptions.RequestException as e:
            APP.logger.exception(e)
            print 'Primary timed out!'
        try:
            backup_request = requests.get(CONFIG["BACKUP_NPN_API"] + winds, timeout=timeout)
            return backup_request.json()
        except requests.exceptions.RequestException as e:
            APP.logger.exception(e)
            print 'Backup timed out. Fail!'
        return None

def retrieve_raob(date, hour_str, icao):
    """
    Reads in npn data from ROCSTAR.
    Tries the primary ROCSTAR server first with timeout,
    then tries the backup ROCSTAR.
    """
    timestamp = date + hour_str + '00'
    timeout = 5
    raob_request = 'raob.py?ts=' + timestamp + '&station=KOUN'
    print raob_request
    try:
        primary_request = requests.get(CONFIG["IOWA_STATE_API"] + raob_request, timeout=timeout)
        return primary_request.json()
    except requests.exceptions.RequestException as e:
        APP.logger.exception(e)
        print 'Primary timed out!'
    return {"profiles": []}

def hourly(npn_data, hours):
    """
    Returns the percentage availability of hourly data encountered,
    from given expected number of hours.
    """
    hourly_availability = (len(npn_data) / float(hours)) * 100
    return hourly_availability

def difference(date, icao, hours, variable, hourly='t', overall=False, npn_data=False, raob=False, qc=False):
    """
    Computes difference between NPN data and HRRR data by interpolating to 
    regular height levels, starting at 100 meters, going to 10 km, at 100 meter intervals.
    """
    verification_heights = np.arange(100, 10000, 100)
    # accounts for extra data due to system restarts or six minute data
    extra_data_factor = 3 if hourly == 't' else 10
    verification = np.zeros((hours * extra_data_factor, verification_heights.shape[0]))
    verification.fill(np.nan)
    if not npn_data:
        npn_data = retrieve_npn_winds(date, icao, hourly=hourly, hours=hours)
    max_height_list = [hourly['max_ht'] for hourly in npn_data]
    mean_max_height = np.mean(np.asarray(max_height_list))
    for hour, npn_hourly in enumerate(npn_data):
        npn_hourly_data_qc = high_mode_qc(npn_hourly['data'], mean_max_height)
        npn_hourly_data = npn_hourly_data_qc if qc else npn_hourly['data']
        timestamp = npn_hourly['timestamp']
        utc_dt = datetime.utcfromtimestamp(timestamp)
        hour_str = '%02d' % utc_dt.hour
        iso_date_str = utc_dt.isoformat().split('T')[0].replace('-','')
        if raob:
            if hour_str not in ['00', '12']:
                continue
            else:
                raob_json = retrieve_raob(iso_date_str, hour_str, icao)
                raob_profile = raob_json["profiles"]
                if raob_profile:
                    raob_data = raob_profile[0]["profile"]
                else:
                    continue 
                comparison_heights = np.asarray([level["hght"] for level in raob_data])
                comparison_sknt = np.asarray([level["sknt"] for level in raob_data])
                comparison_drct = np.asarray([level["drct"] for level in raob_data])
                comparison_u, comparison_v = profiler_metr.wind_components(comparison_sknt * 1.944, comparison_drct)
        else:
            comparison_heights, comparison_u, comparison_v = retrieve_hrrr_winds(iso_date_str, hour_str, icao)
        npn_heights = np.asarray([level["HT"] for level in npn_hourly_data])
        npn_uv = [profiler_metr.wind_components(level["SPD"], level["DIR"]) for level in npn_hourly_data]
        npn_u = [component[0] for component in npn_uv]
        npn_v = [component[1] for component in npn_uv]
        if comparison_heights.shape[0] < 2 or npn_heights.shape[0] < 2:
            diff = np.full_like(verification_heights, np.nan, dtype=np.double)
        else:
            interpolation_tuple = (comparison_heights, comparison_u, comparison_v, npn_heights, npn_u, npn_v, verification_heights, variable)
            diff = profiler_metr.interpolate_uv(interpolation_tuple)
        verification[hour] = diff
    verification = np.around(verification, decimals=2)
    verification_mean = np.around(np.nanmean(verification, axis=0), decimals=1)
    verification_std = np.around(np.nanstd(verification, axis=0), decimals=1)
    sample_size = np.count_nonzero(~np.isnan(verification), axis=0).tolist()
    all_obs = [{'x': ob, 'y': verification_heights[idx]} for hour in verification for idx, ob in enumerate(hour) if not np.isnan(ob)]
    mean_obs = [{'x': mean, 'y': verification_heights[idx]} for idx, mean in enumerate(verification_mean) if not np.isnan(mean)]
    std_obs = [{'x': std, 'y': verification_heights[idx]} for idx, std in enumerate(verification_std) if not np.isnan(std)]
    sample_size_idx = [idx for idx, std in enumerate(verification_std) if not np.isnan(std)]
    sample_size_dict = dict((idx, sample_size[size_idx]) for idx, size_idx in enumerate(sample_size_idx))
    overall_mean = np.nanmean(verification_mean)
    overall_std = np.nanmean(verification_std)
    print overall_mean
    utc_dt_start = datetime.utcfromtimestamp(npn_data[0]['timestamp'])
    start_date_str = utc_dt_start.strftime('%Y-%m-%d')
    end_date_str = utc_dt.strftime('%Y-%m-%d')
    title_str = start_date_str + ' to ' + (end_date_str if hours > 24 else end_date_str) + ' - '  + variable + ' Differences'
    if overall:
        return (overall_mean, overall_std)
    else:
        return (all_obs, mean_obs, std_obs, 
                sample_size_dict, title_str)

def model_check(date, icao, hours, variable):
    """
    Computes difference between NPN data and HRRR data by interpolating to 
    regular height levels, starting at 100 meters, going to 10 km, at 100 meter intervals.
    """
    verification_heights = np.arange(100, 10000, 100)
    verification = np.zeros((hours, verification_heights.shape[0]))
    verification.fill(np.nan)
    for hour in range(hours):
        init_datetime = datetime.strptime(date + '23', '%Y%m%d%H')
        if hour == 0:
            dt_end = init_datetime
        hour_datetime = init_datetime - timedelta(hours=hour)
        date_str = hour_datetime.strftime('%Y%m%d')
        hour_str = '%02d' % hour_datetime.hour
        if hour_str in ['00', '12']:
            raob_json = retrieve_raob(date_str, hour_str, icao)
            raob_profile = raob_json["profiles"]
            if raob_profile:
                raob_data = raob_profile[0]["profile"]
            else:
                continue 
            comparison_heights = np.asarray([level["hght"] + 357. for level in raob_data])
            comparison_sknt = np.asarray([level["sknt"] for level in raob_data])
            comparison_drct = np.asarray([level["drct"] for level in raob_data])
            comparison_u, comparison_v = profiler_metr.wind_components(comparison_sknt * 0.514, comparison_drct)
            hrrr_heights, hrrr_u, hrrr_v = retrieve_hrrr_winds(date_str, hour_str, icao)
            if comparison_heights.shape[0] < 2 or hrrr_heights.shape[0] < 2:
                diff = np.full_like(verification_heights, np.nan, dtype=np.double)
            else:
                interpolation_tuple = (comparison_heights, comparison_u, comparison_v, hrrr_heights, hrrr_u, hrrr_v, verification_heights, variable)
                diff = profiler_metr.interpolate_uv(interpolation_tuple)
            verification[hour] = diff
        else:
            continue
    verification = np.around(verification, decimals=2)
    verification_mean = np.around(np.nanmean(verification, axis=0), decimals=1)
    verification_std = np.around(np.nanstd(verification, axis=0), decimals=1)
    sample_size = np.count_nonzero(~np.isnan(verification), axis=0).tolist()
    all_obs = [{'x': ob, 'y': verification_heights[idx]} for hour in verification for idx, ob in enumerate(hour) if not np.isnan(ob)]
    mean_obs = [{'x': mean, 'y': verification_heights[idx]} for idx, mean in enumerate(verification_mean) if not np.isnan(mean)]
    std_obs = [{'x': std, 'y': verification_heights[idx]} for idx, std in enumerate(verification_std) if not np.isnan(std)]
    sample_size_idx = [idx for idx, std in enumerate(verification_std) if not np.isnan(std)]
    sample_size_dict = dict((idx, sample_size[size_idx]) for idx, size_idx in enumerate(sample_size_idx))
    overall_mean = np.nanmean(verification_mean)
    overall_std = np.nanmean(verification_std)
    start_date_str = hour_datetime.strftime('%Y-%m-%d')
    end_date_str = dt_end.strftime('%Y-%m-%d')
    title_str = start_date_str + ' to ' + (end_date_str if hours > 24 else end_date_str) + ' - '  + variable + ' Model vs. Radiosonde'
    return (all_obs, mean_obs, std_obs, sample_size_dict, title_str)

def available(date, icao, hours, overall=False, npn_data=False):
    """
    Computes height availability
    """
    if not npn_data:
        npn_data = retrieve_npn_winds(date, icao, hours=hours)
    heights = defaultdict(list)
    for hour, npn_hourly in enumerate(npn_data):
        npn_hourly_data = npn_hourly["data"]
        npn_heights = np.asarray([level["HT"] for level in npn_hourly_data])
        npn_speed = np.asarray([level["SPD"] for level in npn_hourly_data])
        for idx, height in enumerate(npn_heights):
            height_int = int(height)
            heights[height_int].append(npn_speed[idx])
    for height in heights:
        H = heights[height]
        H = np.asarray(H, dtype=np.float32)
        length_data = H.shape[0]
        heights[height] = length_data / float(hours)
    heights = OrderedDict(sorted(heights.iteritems(), key=lambda x: x[0]))
    availability = [{'x': availability, 'y': height} for height, availability in heights.iteritems()]
    available = [available['x'] for available in availability]
    available_smoothed = np.around(gaussian_filter1d(available, 4), decimals=3)
    median_available = round(np.median(np.asarray(available)), 2)
    availability_smoothed = [{'x': available_smoothed[idx], 'y': available['y']} for idx, available in enumerate(availability)]
    utc_dt_start = datetime.utcfromtimestamp(npn_data[0]['timestamp'])
    utc_dt_end = datetime.utcfromtimestamp(npn_data[-1]['timestamp'])
    start_date_str = utc_dt_start.strftime('%Y-%m-%d')
    end_date_str = utc_dt_end.strftime('%Y-%m-%d')
    title_str = start_date_str + ' to ' + end_date_str if hours > 24 else end_date_str
    if overall:
        return median_available * 100
    else:
        return (availability, availability_smoothed, title_str)


@APP.route('/compare')
def compare_profiles():
    """
    endpoint for compare method
    """
    hrrr_data = []
    date = request.args.get('date')
    icao = request.args.get('icao')
    qc = request.args.get('qc') == 'on'
    hourly = request.args.get('hourly')
    npn_data = retrieve_npn_winds(date, icao, hourly=hourly)
    max_height_list = [timeframe['max_ht'] for timeframe in npn_data]
    mean_max_height = np.mean(np.asarray(max_height_list))
    for hour, npn_timestep in enumerate(npn_data):
        npn_timestep_data_qc = high_mode_qc(npn_timestep['data'], mean_max_height)
        npn_timestep_data = npn_timestep_data_qc if qc else npn_timestep['data']
        npn_timestep['data'] = npn_timestep_data
        timestamp = npn_timestep['timestamp']
        utc_dt = datetime.utcfromtimestamp(timestamp)
        hour_str = '%02d' % utc_dt.hour
        iso_date_str = utc_dt.isoformat().split('T')[0].replace('-','')
        hrrr_zip = retrieve_hrrr_winds(iso_date_str, hour_str, icao, convert_uv=True)
        hrrr_timestep_data = [{"SPD": speed, "DIR": direction,
                              "HT": height}
                              for height, speed, direction
                              in hrrr_zip if speed < 999]
        hrrr_heights = np.asarray([level["HT"] for level in hrrr_timestep_data])
        npn_heights = np.asarray([level["HT"] for level in npn_timestep_data])
        hrrr_data.append({"hourly": hourly, "site-id": CONFIG["WMO_SITE_IDS"].get(icao, icao),
                         "min_ht": npn_timestep["min_ht"], "timestamp": timestamp,
                         "ICAO": "HRRR ANALYSIS - WMO ID " + CONFIG["WMO_SITE_IDS"].get(icao, icao),
                         "max_ht": npn_timestep["max_ht"],
                         "data": hrrr_timestep_data})
        npn_timestep["ICAO"] = npn_timestep["ICAO"] + " - Hi Mode QC On" if qc else npn_timestep["ICAO"]
    global_max_height = int(round(max(max_height_list) / 1000.))
    global_out = {"npn": npn_data, "hrrr": hrrr_data, "global_max_ht": global_max_height}
    return json.dumps(global_out)

@APP.route('/model')
def model():
    """
    endpoint for model check method
    """
    date = request.args.get('date')
    icao = request.args.get('icao')
    hours = int(request.args.get('hours'))
    variable = request.args.get('variable')
    all_obs, mean_obs, std_obs, sample_size_dict, title_str = model_check(date, icao, hours, variable)
    return json.dumps({'all_obs': all_obs, 'mean_obs': mean_obs,
                       'std_obs': std_obs, 'sample_size': sample_size_dict,
                       'title': title_str})

@APP.route('/difference')
def difference_profiles():
    """
    endpoint for difference method
    """
    date = request.args.get('date')
    icao = request.args.get('icao')
    hours = int(request.args.get('hours'))
    hourly = request.args.get('hourly')
    variable = request.args.get('variable')
    qc = request.args.get('qc') == 'on'
    all_obs, mean_obs, std_obs, sample_size_dict, title_str = difference(date, icao, hours, variable, qc=qc, hourly=hourly)
    return json.dumps({'all_obs': all_obs, 'mean_obs': mean_obs, 
                       'std_obs': std_obs,
                       'sample_size': sample_size_dict, 
                       'title': title_str}) 

@APP.route('/available')
def data_availability():
    """
    endpoint for availability method
    """
    date = request.args.get('date')
    icao = request.args.get('icao')
    hours = int(request.args.get('hours'))
    availability, availability_smoothed, title_str = available(date, icao, hours)
    return json.dumps({'availability': availability,
                       'availability_smoothed': availability_smoothed, 'title': title_str})

@APP.route('/overview')
def overview():
    """
    endpoint for dashboard overview
    """
    date = request.args.get('date')
    icao = request.args.get('icao')
    hours = int(request.args.get('hours'))
    npn_data = retrieve_npn_winds(date, icao, hours=hours)
    hourly_availability = hourly(npn_data, hours)
    mean_difference, std_difference = difference(date, icao, hours, 'Speed', overall=True, npn_data=npn_data)
    median_availability = available(date, icao, hours, overall=True, npn_data=npn_data)
    overall_dqi = ((hourly_availability * 0.25) + (((1 - abs(mean_difference) / 10.) * 100) * 0.5) + (median_availability * 0.25))
    return json.dumps({'mean_difference': mean_difference,
                       'std_difference':std_difference,
                       'median_availability': median_availability,
                       'hourly_availability': hourly_availability,
                       'overall_dqi':overall_dqi})

@APP.route('/data_outages')
def data_outages():
    """
    endpoint for data outage tracking
    """
    conn = connect_db()
    cursor = conn.cursor()
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    start_date_sql = sqlite_date_parse(start_date)
    end_date_sql = sqlite_date_parse(end_date)
    icao = request.args.get('icao')
    cursor.execute("SELECT fname FROM hourly WHERE day BETWEEN '%s' AND '%s' AND icao = '%s'" % (start_date_sql, end_date_sql, icao))
    hourly = cursor.fetchall()
    hourly_times = [str(time[0][6:18]) for time in hourly]
    hourly_outages = []
    for dt in generate_expected_dates(start_date, end_date, True):
        timestamp = dt.strftime('%Y%m%d%H%M')
        data_present_boolean = 0 if timestamp not in hourly_times else 1
        hourly_outages.append({'x': timestamp[:8] + 'T' + timestamp[8:12], 'y': data_present_boolean})
    cursor.execute("SELECT fname FROM sixmin WHERE day BETWEEN '%s' AND '%s' AND icao = '%s'" % (start_date_sql, end_date_sql, icao))
    six_minute = cursor.fetchall()
    six_minute_times = [str(time[0][6:18]) for time in six_minute]
    six_minute_outages = []
    for dt in generate_expected_dates(start_date, end_date, False):
        timestamp = dt.strftime('%Y%m%d%H%M')
        data_present_boolean = 0 if timestamp not in six_minute_times else 1
        six_minute_outages.append({'x': timestamp[:8] + 'T' + timestamp[8:12], 'y': data_present_boolean})
    conn.close()
    return json.dumps({'hourly': hourly_outages, 'sixmin': six_minute_outages})

@APP.route('/data_outages_metadata')
def data_outages_metadata():
    """
    endpoint for data outage tracking metadata including icao and dates
    """
    dates_with_data = {}
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT icao from hourly")
    sites = cursor.fetchall()
    sites = [site[0] for site in sites]
    for site in sites:
        cursor.execute('SELECT DISTINCT day as "day [date]" from hourly')
        dates = cursor.fetchall()
        dates = [date[0].isoformat().split('T')[0] for date in dates]
        dates_with_data.update({site: dates})
    conn.close()
    return json.dumps({'sites': sites, 'dates': dates_with_data})


@APP.route('/')
def index_html():
    """
    Sends main page static HTML
    """
    return APP.send_static_file('templates/index.html')

@APP.route('/profiles')
def profile_html():
    """
    Sends profile comparison static HTML
    """
    return APP.send_static_file('templates/compare_profiles.html')

@APP.route('/outages')
def track_html():
    """
    Sends data outages static HTML
    """
    return APP.send_static_file('templates/data_outages.html')

if __name__ == '__main__':
    APP.debug = True
    APP.run(CONFIG["SERVER_IP_ADDRESS"])
