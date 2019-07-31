"""
Filename: compare_npn_to_hrrr.py

Purpose: Reads and parses NGNPN CSV data and HRRR model anaylsis BUFR soundings

Author: Brandon Taylor

Date: 20190411

"""
import csv, os, math, json
import requests, time
from collections import defaultdict, OrderedDict
from logging.config import dictConfig
from datetime import datetime
import numpy as np
from scipy.ndimage import gaussian_filter1d
from flask import Flask, request
from flask_cors import CORS
import ncepbufr

APP = Flask(__name__)
CORS(APP)

PRIMARY_NPN_API = 'http://rocstar1/npn_api/'
BACKUP_NPN_API = 'http://rocstar2/npn_api/'
AK_DATA_DIR = '../hrrr_ak/BUFR'
CONUS_DATA_DIR = '../hrrr_conus/BUFR'
DEMO_DATA_DIR = '../data'
NPN_ICAO = 'ROCO2'
WMO_ID = '723570'
DATES_DIRS = sorted(os.listdir(os.path.join(DEMO_DATA_DIR, NPN_ICAO, 'CSV')))
LOG_FILE = '/tmp/npn-dq-tool.log'

WMO_SITE_IDS = {'TLKA': '702510',
                'HWPA': '703410',
                'ROCO': '723570'
}

dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {'file_handler': {
        'class': 'logging.handlers.RotatingFileHandler',
        'formatter': 'default',
        'filename': LOG_FILE,
        'level': 'DEBUG'
    }},
    'root': {
        'level': 'DEBUG',
        'handlers': ['file_handler']
    }
})

def pressure_to_height(pressure, elev):
    """
    Converts pressure to height using the U.S. standard atmosphere,
    subtracting station elevation to yield height AGL
    """
    temp_naught = 288. # units K
    gamma = 6.5e-3 # units K/m
    pressure_naught = 1013.25 # units hPa
    dry_air_gas_constant = 287. # units J/kgK
    gravity = 9.81 # units m/s^2
    exponent_1 = (dry_air_gas_constant * gamma / gravity)
    factor_1 = (temp_naught / gamma)
    factor_2 = (1. - (pressure / pressure_naught) ** exponent_1)
    return (factor_1 * factor_2) - elev

def wind_speed(u_vec, v_vec):
    """
    Computes the wind speed from u and v components
    """
    return np.sqrt(u_vec * u_vec + v_vec * v_vec)

def wind_direction(u_vec, v_vec):
    """
    Computes the wind direction from u and v components
    """
    wdir = 90. - (180. / math.pi * np.arctan2(-v_vec, -u_vec))
    wdir[wdir <= 0] += 360.
    return wdir

def wind_components(speed, wdir):
    """
    Computes the vector components of wind from speed and direction.
    Wind components are return as U (east-west) and V (north-south). 
    """
    return None

def read_ncep_bufr(fname):
    """
    Reads NCEP BUFR type files,
    which include the local table as the first message.
    Extracts and converts height and wind speed/direction.
    """
    data_exists = False
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
        if not data_exists:
            pressure_pa = np.zeros((50,))
            u_wind = np.zeros((50,)) 
            v_wind = np.zeros((50,))
            elev = 0.0
        bufr.close()
        pressure_hpa = pressure_pa / 100.
        height = np.around(pressure_to_height(pressure_hpa, elev), decimals=1)
        direction = np.around(wind_direction(u_wind, v_wind), decimals=1)
        speed = np.around(wind_speed(u_wind, v_wind), decimals=1)
        return zip(height, speed, direction)
    except IOError as err:
        print 'IO error reading NCEP BUFR file %s, skipping for now' % err
        APP.logger.exception(err)
        return zip([0], [0], [0])
    except IndexError as err:
        print 'Index error while reading NCEP BUFR file %s, skipping for now' % err
        APP.logger.exception(err)
        return zip([0], [0], [0])

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
                data = [row for row in raw_data if len(row) == 7][1:]
                height = [float(data_point[0]) for data_point in data]
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
        global_max_height = min(npn_max_height, hrrr_max_height)
        global_min_height = max(npn_min_height, hrrr_min_height)
        return (global_max_height, global_min_height)
    except:
        return (1e4, 0)

def retrieve_hrrr_winds(date, hour, icao):
    wmo_id = WMO_SITE_IDS[icao]
    hrrr_fname = 'bufr.' + wmo_id + '.' + date + hour
    data_dir = CONUS_DATA_DIR if icao == 'ROCO' else AK_DATA_DIR
    hrrr_fpath = os.path.join(data_dir, wmo_id, date, hrrr_fname)
    hrrr_data_zipped = read_ncep_bufr(hrrr_fpath)
    return hrrr_data_zipped

def retrieve_npn_winds(date, icao):
    winds = 'winds?hourly=t&hours=24&enddate=' + date + '2359&icao=' + icao
    try:
        primary_request = requests.get(PRIMARY_NPN_API + winds, timeout=2.5)
        return primary_request.json()
    except requests.exceptions.RequestException as e:
        APP.logger.exception(e)
    try:
        backup_request = requests.get(BACKUP_NPN_API + winds, timeout=2.5)
        return backup_request.json()
    except requests.exceptions.RequestException as e:
        APP.logger.exception(e)
    return None

def format_path_and_read(date, hour, npn_only=False):
    npn_fname = NPN_ICAO + '-' + date + hour + '0000.npn.hrlywind.csv'
    hrrr_fname = 'bufr.' + WMO_ID + '.' + date + hour
    npn_fpath = os.path.join(DEMO_DATA_DIR, NPN_ICAO, 'CSV', date, npn_fname)
    hrrr_fpath = os.path.join(DEMO_DATA_DIR, date, WMO_ID, hrrr_fname)
    npn_data_zipped = read_npn_csv(npn_fpath)
    hrrr_data_zipped = read_ncep_bufr(hrrr_fpath)
    return npn_data_zipped if npn_only else (npn_data_zipped, hrrr_data_zipped)

@APP.route('/compare')
def compare_profiles():
    hrrr_out = []
    date = request.args.get('date')
    icao = request.args.get('icao')
    npn_data = retrieve_npn_winds(date, icao)
    for hour, npn_hourly in enumerate(npn_data):
        npn_hourly_data = npn_hourly['data']
        timestamp = npn_hourly['timestamp']
        utc_dt = datetime.utcfromtimestamp(timestamp)
        hour_str = '%02d' % utc_dt.hour
        iso_date_str = utc_dt.isoformat().split('T')[0].replace('-','')
        hrrr_zip = retrieve_hrrr_winds(iso_date_str, hour_str, icao)
        hrrr_hourly_data = [{"SPD": speed, "DIR": direction,
                             "HT": height}
                            for height, speed, direction
                            in hrrr_zip if speed < 999]
        hrrr_heights = np.asarray([level["HT"] for level in hrrr_hourly_data])
        npn_heights = np.asarray([level["HT"] for level in npn_hourly_data])
        global_max_height, global_min_height = calc_min_max(npn_heights, hrrr_heights)
        hrrr_out.append({"hourly": "t", "site-id": WMO_SITE_IDS[icao],
                         "min_ht": global_min_height, "timestamp": timestamp,
                         "ICAO": "HRRR ANALYSIS - WMO ID " + WMO_SITE_IDS[icao],
                         "max_ht": global_max_height,
                         "data": hrrr_hourly_data})
    global_out = {"npn": npn_data, "hrrr": hrrr_out}
    return json.dumps(global_out)

@APP.route('/difference')
def difference_profiles():
    all_days = True if request.args.get('all') == 'true' else False
    verification_heights = np.arange(400., 16000, 100.)
    days = len(DATES_DIRS) if all_days else 1
    verification = np.zeros((days, 24, verification_heights.shape[0]))
    date = request.args.get('date')
    icao = request.args.get('icao')
    npn_data = retrieve_npn_winds(date, icao)
    title = 'All ' + str(days) + ' days' if all_days else date
    for hour, npn_hourly in enumerate(npn_data):
        npn_hourly_data = npn_hourly['data']
        timestamp = npn_hourly['timestamp']
        utc_dt = datetime.utcfromtimestamp(timestamp)
        hour_str = '%02d' % utc_dt.hour
        iso_date_str = utc_dt.isoformat().split('T')[0].replace('-','')
        hrrr_zip = retrieve_hrrr_winds(iso_date_str, hour_str, icao)
        hrrr_hourly_data = [{"SPD": speed, "DIR": direction,
                             "HT": height}
                            for height, speed, direction
                            in hrrr_zip if speed < 999]
        hrrr_heights = np.asarray([level["HT"] for level in hrrr_hourly_data])
        npn_heights = np.asarray([level["HT"] for level in npn_hourly_data])
        hrrr_speed = np.asarray([level["SPD"] for level in hrrr_hourly_data])
        npn_speed = np.asarray([level["SPD"] for level in npn_hourly_data])
        if hrrr_speed.shape[0] == 0 or npn_speed.shape[0] == 0:
            hrrr_speed_interp = np.full_like(verification_heights, np.nan, dtype=np.double)
            npn_speed_interp = np.full_like(verification_heights, np.nan, dtype=np.double)
            speed_diff = np.full_like(verification_heights, np.nan, dtype=np.double)
        else:
            hrrr_speed_interp = np.interp(verification_heights, hrrr_heights, hrrr_speed)
            npn_speed_interp = np.interp(verification_heights, npn_heights, npn_speed)
            speed_diff = hrrr_speed_interp - npn_speed_interp
        verification[0][hour] = speed_diff
    verification = np.around(verification, decimals=2)
    verification_mean = np.around(np.nanmean(verification, axis=(0,1)), decimals=1)
    verification_std = np.around(np.nanstd(verification, axis=(0,1)), decimals=1)
    std_obs = [{'x': std, 'y': verification_heights[idx]} for idx, std in enumerate(verification_std) if not np.isnan(std)]
    mean_obs = [{'x': mean, 'y': verification_heights[idx]} for idx, mean in enumerate(verification_mean) if not np.isnan(mean)]
    all_obs = [{'x': speed, 'y': verification_heights[idx]} for day in verification for hour in day for idx, speed in enumerate(hour) if not np.isnan(speed)]
    return json.dumps({'all_obs': all_obs, 'mean_obs': mean_obs, 'std_obs': std_obs, 'title': title})

@APP.route('/available')
def data_availability():
    all_days = True if request.args.get('all') == 'true' else False
    days = len(DATES_DIRS) if all_days else 1
    index = int(request.args.get('index'))
    date_directories = DATES_DIRS if all_days else [DATES_DIRS[index]]
    title = 'All ' + str(days) + ' days' if all_days else DATES_DIRS[index]
    heights = defaultdict(list)
    for date_idx, date in enumerate(date_directories):
        for hour in range(24):
            hour_str = '%02d' % hour
            datetime_obj = datetime.strptime(date + hour_str, '%Y%m%d%H')
            timestamp = (datetime_obj - datetime(1970, 1, 1)).total_seconds()
            npn_zip = format_path_and_read(date, hour_str, npn_only=True)
            for height, speed , _ in npn_zip:
                height_int = int(height)
                heights[height_int].append(speed)
    for height in heights:
        H = heights[height]
        H = np.asarray(H, dtype=np.float32)
        H[H == 999.9] = np.nan
        valid_data = sum(~np.isnan(H))
        length_data = float(H.shape[0])
        heights[height] = round(valid_data / length_data, 2)
    heights = OrderedDict(sorted(heights.iteritems(), key=lambda x: x[0]))
    availability = [{'x': availability, 'y': height} for height, availability in heights.iteritems()]
    available = [available['x'] for available in availability]
    available_smoothed = np.around(gaussian_filter1d(available, 4), decimals=3)
    max_available = np.max(available_smoothed)
    print max_available
    availability_smoothed = [{'x': available_smoothed[idx], 'y': available['y']} for idx, available in enumerate(availability)]
    return json.dumps({'availability_smoothed': availability_smoothed, 
                       'availability':availability, 'title': title})

@APP.route('/overview')
def data_received():
    date = request.args.get('date')
    icao = request.args.get('icao')
    npn_data = retrieve_npn_winds(date, icao)
    return None

@APP.route('/')
def index_html():
    """
    Sends main page static HTML
    """
    return APP.send_static_file('templates/index.html')

@APP.route('/profiles')
def profile_html():
    """
    Sends profile page static HTML
    """
    return APP.send_static_file('templates/compare_profiles.html')

@APP.route('/differences')
def difference_html():
    """
    Sends difference page static HTML
    """
    return APP.send_static_file('templates/difference_profiles.html')

@APP.route('/availability')
def availability_html():
    """
    Sends availability page static HTML
    """
    return APP.send_static_file('templates/availability.html')

if __name__ == '__main__':
    APP.debug = True
    APP.run('10.20.58.144')
