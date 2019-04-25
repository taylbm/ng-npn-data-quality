"""
Filename: compare_npn_to_hrrr.py

Purpose: Reads and parses NGNPN CSV data and HRRR model anaylsis BUFR soundings

Author: Brandon Taylor

Date: 20190411

"""
import csv, os, math, json
from datetime import datetime
import numpy as np
from flask import Flask, request
from flask_cors import CORS
import ncepbufr

app = Flask(__name__)
CORS(app)

NPN_ICAO = 'ROCO2'
WMO_ID = '723570'
DATES_DIRS = sorted(os.listdir(os.path.join(NPN_ICAO, 'CSV')))

def pressure_to_height(pressure):
    """
    Converts pressure to height using the U.S. standard atmosphere
    """
    temp_naught = 288. # units K
    gamma = 6.5e-3 # units K/m
    pressure_naught = 1013.25 # units hPa
    dry_air_gas_constant = 287. # units J/kgK
    gravity = 9.81 # units m/s^2
    exponent_1 = (dry_air_gas_constant * gamma / gravity)
    factor_1 = (temp_naught / gamma)
    factor_2 = (1. - (pressure / pressure_naught) ** exponent_1)
    return factor_1 * factor_2

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
                ftim = bufr.read_subset('FTIM')[0][0]
                print fname, ftim
                if ftim == 0.:
                    data_exists = True
                    pressure_pa = bufr.read_subset('PRES')[0]
                    u_wind = bufr.read_subset('UWND')[0]
                    v_wind = bufr.read_subset('VWND')[0]
        if not data_exists:
            pressure_pa = np.zeros((50,))
            u_wind = np.zeros((50,)) 
            v_wind = np.zeros((50,))   
        bufr.close()
        pressure_hpa = pressure_pa / 100.
        height = np.around(pressure_to_height(pressure_hpa), decimals=1)
        direction = np.around(wind_direction(u_wind, v_wind), decimals=1)
        speed = np.around(wind_speed(u_wind, v_wind), decimals=1)
        return zip(height, speed, direction)
    except IOError as err:
        print 'Error reading NCEP BUFR file %s, skipping for now' % err
        return zip([0], [0], [0])

def read_npn_csv(fname):
    """
    Reads NGNPN CSV files.
    Extracts and converts height and wind speed/direction.
    """
    with open(fname, 'rb') as csv_file_obj:
        reader = csv.reader(csv_file_obj)
        try:
            raw_data = [row for row in reader]
            data = [row for row in raw_data if len(row) == 7][1:]
            data = data[::3]
            height = [float(data_point[0]) for data_point in data]
            speed = [float(data_point[3]) for data_point in data]
            direction = [float(data_point[2]) for data_point in data]
            return zip(height, speed, direction)
        except csv.Error as err:
            print 'file %s, line %d: %s' % (fname, reader.line_num, err)
            return zip([0], [0], [0])

def calc_min_max(npn_heights, hrrr_heights):
    """
    Calculates the height bounds across a time-series
    """
    npn_max_height = npn_heights.max()
    npn_min_height = npn_heights.min()
    hrrr_max_height = hrrr_heights.max()
    hrrr_min_height = hrrr_heights.min()
    global_max_height = min(npn_max_height, hrrr_max_height)
    global_min_height = max(npn_min_height, hrrr_min_height)
    return (global_max_height, global_min_height)

@app.route('/compare')
def compare_profiles():
    npn_out = []
    hrrr_out = []
    index = int(request.args.get('index'))
    index = 0
    date = DATES_DIRS[index]
    for hour in range(21):
        hour_str = '%02d' % hour
        datetime_obj = datetime.strptime(date + hour_str, '%Y%m%d%H')
        timestamp = (datetime_obj - datetime(1970, 1, 1)).total_seconds()
        npn_fname = os.path.join(NPN_ICAO, 'CSV', date, NPN_ICAO + '-' +
                                 date + hour_str + '0000.npn.hrlywind.csv')
        hrrr_fname = os.path.join(WMO_ID, date, 'bufr.' + WMO_ID +
                                  '.' + date + hour_str)
        npn_data_zipped = read_npn_csv(npn_fname)
        hrrr_data_zipped = read_ncep_bufr(hrrr_fname)
        hrrr_data = [{"SPD": speed, "DIR": direction,
                      "HT": height}
                     for height, speed, direction
                     in hrrr_data_zipped if speed < 999]
        npn_data = [{"SPD": speed, "DIR": direction,
                     "HT": height}
                    for height, speed, direction in npn_data_zipped
                    if speed < 999]
        hrrr_heights = np.asarray([level["HT"] for level in hrrr_data])
        npn_heights = np.asarray([level["HT"] for level in npn_data])
        hrrr_data_masked = [level for level in hrrr_data
                            if np.abs(npn_heights - level["HT"]).min() < 250]
        npn_data_masked = [level for level in npn_data
                          if np.abs(hrrr_heights - level["HT"]).min() < 250]
        global_max_height, global_min_height = calc_min_max(npn_heights, hrrr_heights)
        npn_out.append({"hourly": "t", "site-id": "ROC Testbed",
                        "min_ht": global_min_height, "timestamp": timestamp,
                        "ICAO": "ROCO2", "max_ht": global_max_height,
                        "data": npn_data_masked})
        hrrr_out.append({"hourly": "t", "site-id": "HRRR Sounding",
                         "min_ht": global_min_height, "timestamp": timestamp,
                         "ICAO": "HRRR ANALYSIS - KOUN",
                         "max_ht": global_max_height,
                         "data": hrrr_data_masked})
        global_out = {"npn": npn_out, "hrrr": hrrr_out}
    return json.dumps(global_out)

@app.route('/profiles')
def profile_html():
    """
    Sends main page static HTML
    """
    return app.send_static_file('compare_profiles.html')

if __name__ == '__main__':
    app.debug = True
    app.run()
