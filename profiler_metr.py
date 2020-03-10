"""
Filename: profiler_metr.py

Purpose: A collection of meteorological calculations used to 
manipulate profiler data into a form usable for analysis.

Author: Brandon Taylor

Date: 20200310

Last Modified: 20200310

"""

import math
import numpy as np
from scipy.interpolate import interp1d

def pressure_to_height(pressure, elev):
    """
    Converts pressure to height using the U.S. Standard Atmosphere,
    subtracting station elevation to yield height above Mean Sea Level (MSL).
    """
    temp_naught = 293. # units K
    gamma = 6.5e-3 # units K/m
    pressure_naught = 1013.25 # units hPa
    dry_air_gas_constant = 287. # units J/kgK
    gravity = 9.81 # units m/s^2
    exponent_1 = (dry_air_gas_constant * gamma / gravity)
    factor_1 = (temp_naught / gamma)
    factor_2 = (1. - (pressure / pressure_naught) ** exponent_1)
    return (factor_1 * factor_2) + elev

def wind_direction_difference(wdir_hrrr, wdir_npn):
    """
    Rotates the wind difference calculation,
    so that they lie betweeen -180 and 180.
    """
    difference = wdir_hrrr- wdir_npn
    condition_1 = np.where(difference > 180, difference - 360., difference)
    condition_2 = np.where(condition_1 < -180, condition_1 + 360, condition_1)
    return condition_2

def hypsometric(specific_humidities, temperatures, pressures, elev):
    """
    Calculates the thickness of the layer using the hypsometric equation.
    Returns the resulting geometric heights in a numpy array.
    """
    geometric_height = [elev]
    pressures_list = list(pressures)
    pressures_length = len(pressures_list)
    if pressures_list[0] == 0:
        return np.zeros((50,))
    for idx, pressure in enumerate(pressures_list):
        if idx == pressures_length - 1:
            break
        dry_air_gas_constant = 287. # units J/kgK
        gravity = 9.81 # units m/s^2
        mean_virtual_temperature = ((1 + 0.61 * specific_humidities[idx]) * temperatures[idx] +
                                    (1 + 0.61 * specific_humidities[idx+1]) * temperatures[idx+1]) / 2.
        layer_depth = geometric_height[idx] + ((dry_air_gas_constant * mean_virtual_temperature) / gravity) * math.log(pressures[idx]/pressures[idx+1])
        geometric_height.append(layer_depth)
    return np.asarray(geometric_height)

def wind_speed(u_vec, v_vec):
    """
    Computes the wind speed from u and v components.
    """
    return np.sqrt(u_vec * u_vec + v_vec * v_vec)

def wind_direction(u_vec, v_vec):
    """
    Computes the wind direction from u and v components.
    """
    wdir = 90. - (180. / math.pi * np.arctan2(-v_vec, -u_vec))
    wdir[wdir <= 0] += 360.
    return wdir

def wind_components(speed, wdir_deg):
    """
    Computes the vector components of wind from speed and direction.
    Wind components are return as U (east-west) and V (north-south). 
    """
    wdir_rad = wdir_deg * np.pi / 180.
    u_vec = -speed * np.sin(wdir_rad)
    v_vec = -speed * np.cos(wdir_rad)
    return (u_vec, v_vec)

def interpolate_uv(interpolation_tuple):
    """
    Interpolates the two observation sets to a regular
    grid.
    """
    (comparison_heights, comparison_u, comparison_v, npn_heights, npn_u, npn_v,
    verification_heights, variable) = interpolation_tuple
    comparison_interp1d_u = interp1d(comparison_heights, comparison_u, bounds_error=False)
    npn_interp1d_u = interp1d(npn_heights, npn_u, bounds_error=False)
    comparison_interp_u = comparison_interp1d_u(verification_heights)
    npn_interp_u = npn_interp1d_u(verification_heights)
    comparison_interp1d_v = interp1d(comparison_heights, comparison_v, bounds_error=False)
    npn_interp1d_v = interp1d(npn_heights, npn_v, bounds_error=False)
    comparison_interp_v = comparison_interp1d_v(verification_heights)
    npn_interp_v = npn_interp1d_v(verification_heights)
    if variable == 'Speed':
        diff = wind_speed(comparison_interp_u, comparison_interp_v) - wind_speed(npn_interp_u, npn_interp_v)
    elif variable == 'Direction':
        diff = wind_direction_difference(wind_direction(comparison_interp_u, comparison_interp_v), wind_direction(npn_interp_u, npn_interp_v))
    return diff

