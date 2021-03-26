import pandas
import numpy as np
import random
import json
import math


def get_time_series(df, time_steps):
    '''
    Input:
      Pandas data frame containing data for a single well, single zone, single realisation.
      Sorted list of all time steps in the dataset.

    Creates time series for open/shut state and KH.
    The open/shut info is formatted like this:
    [0,0,0,1,1,1,1,-1,-1,-1]
    '0' means completion not existing, '1' is open, '-1' is shut.
    KH:
    [nan, nan, nan, value1, value1, value1, value1, value2, value2, value2]
    '''
    result = []
    result_kh = []
    d = df.sort_values(by=['DATE'])

    is_open = 0
    kh = math.nan
    c = 0
    t0 = d['DATE'].iat[0]
    for t in time_steps:
        if t == t0:
            v = d['OP/SH'].iat[c]
            kh = d['KH'].iat[c]
            if v == 'OPEN':
                is_open = 1
            elif v == 'SHUT':
                is_open = -1
            c += 1
            if c < d.shape[0]:
                t0 = d['DATE'].iat[c]
        result.append(is_open)
        result_kh.append(kh)
    return (result, result_kh)


def time_series_indexes_by_zone(df, layer_to_zone):
    '''
    Identifies completions belonging to the same (i,j,k).
    Organizes the result in a dictionary by zone and (i,j,k):
    Outputs:
    {
        'zone1': {
            (i,j,k): [index1, index2, index3 ... ],
            (i,j,k): [...],
            ...
        }
        'zone2: {
            ...
        }
    }
    The list of indexes refers to rows in the dataframe.
    '''
    ts = {}
    # identify i,j,k corresponding to zone
    for index in range(df.shape[0]):
        i = df['I'].iat[index]
        j = df['J'].iat[index]
        k1 = df['K1'].iat[index]
        k2 = df['K2'].iat[index]

        # TODO
        # currently we don't support completions covering several layers
        assert(k1 == k2)

        zone_name = layer_to_zone[k1]
        if zone_name not in ts.keys():
            ts[zone_name] = {}

        a = (i, j, k1)
        if a not in ts[zone_name].keys():
            ts[zone_name][a] = []
        ts[zone_name][a].append(index)
    return ts


def time_series_by_zone(df, ts, time_steps):
    '''
    Takes the output from time_series_indexes_by_zone and produces
    a new dictionary where the row indexes have been replaced by
    time series for opsh and kh.
    '''
    gs = {}
    for zonename, zonedata in ts.items():
        gs[zonename] = {}
        zone = gs[zonename]
        for cellidx, indexes in zonedata.items():
            zone[cellidx] = {}
            cell = zone[cellidx]
            comp, kh = get_time_series(
                df.iloc[indexes, :], time_steps)
            cell['opsh'] = comp
            cell['kh'] = kh
    return gs


def reduce_open_shut(values):
    '''
    This function reduces several candidate for open/shut time-series into a single one
    when there are more than one completed cell for a well/zone/realisation.
    '''
    arr = np.asarray(values)

    open_count = np.maximum(arr, 0)
    open_count_reduced = open_count.sum(axis=0)

    shut_count = np.maximum(arr*(-1.), 0)
    shut_count_reduced = shut_count.sum(axis=0)

    time_step_count = open_count_reduced.shape[0]

    opsh = []
    for i in range(time_step_count):
        v = 0  # default is non-existing completion
        # if any value is open, we call the whole zone open,
        # else if anything is shut, we call it shut.
        if open_count_reduced[i] > 0:
            v = 1
        elif shut_count_reduced[i] > 0:
            v = -1
        opsh.append(v)
    return opsh


def reduce_kh(values):
    '''
    This function reduces several candidate for KH time-series into a single one
    when there are more than one completed cell for a well/zone/realisation.
    F.ex the KH can be averaged, summed...
    It may also return the full 2d array unchanged.
    '''
    arr = np.asarray(values)

    # TODO: Choose how to combine KH values

    # sum the KH for all cells in a zone
#    return arr.sum(axis=0)

    # this will preserve all the values for the KH statistics
    return arr


def reduce_over_cells(ts):
    '''
    This function reduces several candidate time-series into a single one
    when there are more than one completed cell for a well/zone/realisation.
    '''
    result = {}
    for zonename, zonedata in ts.items():
        result[zonename] = {}
        zone = result[zonename]

        opsh = [v['opsh'] for v in zonedata.values()]
        zone['opsh'] = reduce_open_shut(opsh)

        kh = [v['kh'] for v in zonedata.values()]
        zone['kh'] = reduce_kh(kh)

    return result


def get_completions_by_zone(df, layer_to_zone, time_steps, realisations):
    '''
    Extracts completions into a dictionary of 2D arrays on the form
    {
        "zone1": {
            'opsh': {
                realisation 1: [ 1d list - time series]
                realisation 2: [ ... ]
                ...
            }
            'kh': {
                realisation 1: [ 1d or 2d list - Nan for missing]
                realisation 2: [ 1d or 2d list - Nan for missing]
                ...
                }
        "zone2": ---
    }
    '''
    completions = {}
    for rname, realdata in df.groupby('REAL'):
        # first find the indexes corresponding to time series:
        ts = time_series_indexes_by_zone(realdata, layer_to_zone)

        # extract opsh and kh as time series over all the time steps
        gs = time_series_by_zone(realdata, ts, time_steps)

        # get rid of multiples caused by more than one (i,j,k) per zone.
        rs = reduce_over_cells(gs)

        for zone_name, values in rs.items():
            if zone_name not in completions.keys():
                completions[zone_name] = {}
                completions[zone_name]['opsh'] = {}
                completions[zone_name]['kh'] = {}
            zone = completions[zone_name]
            zone['opsh'][rname] = rs[zone_name]['opsh']
            zone['kh'][rname] = rs[zone_name]['kh']

    return completions


def compress_time_series(series):
    '''
    Input:
      Dictionary of time series. Must contain series for 'open' and 'shut'.

    The function uses the open/shut state to compress the time series.
    The inital time steps are skipped, if the completion does not exist in any realisation.
    Then only the time steps where open/shut state changes is captured.

    Example:
      ([0, 0, 0, 0.25, 0.25, 1.0, 0], # open state
       [0, 0, 0, 0,    0,    0,   1.0] # shut state
       )
    into a more compact form:
      ([3, 5, 6],        # time steps when the state changes
       [0.25, 1.0, 0.0], # open state
       [0,     0,  1.0]  # shut state
       )

    Any additional time series (KH) is transfered using the same time steps sampling.
    '''
    time_steps = []

    result = {}
    result['t'] = []
    for key in series.keys():
        result[key] = []

    open_series = series['open']
    shut_series = series['shut']

    # validate input
    time_step_count = len(open_series)
    for s in series.values():
        assert(len(s) == time_step_count)

    is_open = 0
    is_shut = 0
    n = len(open_series)
    for i in range(0, n):
        o = open_series[i]
        s = shut_series[i]
        if (i == 0 and (o > 0. or s > 0.)) or o != is_open or s != is_shut:
            time_steps.append(i)
            for key in series.keys():
                result[key].append(series[key][i])
            is_open = open_series[i]
            is_shut = shut_series[i]

    if len(time_steps) == 0:
        return None
    result['t'] = time_steps
    return result


def get_kh_stats_series(dict_values):
    '''
    Input:
      Dictionary of data for each realisation:
      {
          1: [ [ time series ] ]
          2: [ ... ]
          ...
      }

    The data for each realisation can be 1d or 2d.
    Returns mean, max and min as time series in a dictionary.
    '''
    values = []
    for r, d in dict_values.items():
        arr = np.asarray(d)
        # if there are 2d time series, treat the extra dimension as
        # extra realisations.
        if arr.ndim > 1:
            for i in range(arr.shape[0]):
                values.append(arr[i, :])
        else:
            values.append(arr)

    kh_arr2d = np.asarray(values)

    # calculate mean, min, max across realisations

# this works, but gives runtime warnings
#    kh_avg = np.nanmean(kh_arr2d, axis=0)
#    kh_min = np.nanmin(kh_arr2d, axis=0)
#    kh_max = np.nanmax(kh_arr2d, axis=0)

    # process timesteps one by one. Check for all nans.
    kh_avg = []
    kh_min = []
    kh_max = []
    for i in range(kh_arr2d.shape[1]):
        if np.count_nonzero(~np.isnan(kh_arr2d[:, i])) > 0:
            kh_avg.append(np.nanmean(kh_arr2d[:, i]))
            kh_min.append(np.nanmin(kh_arr2d[:, i]))
            kh_max.append(np.nanmax(kh_arr2d[:, i]))
        else:
            kh_avg.append(math.nan)
            kh_min.append(math.nan)
            kh_max.append(math.nan)

    return {'khMean': kh_avg, 'khMin': kh_min, 'khMax': kh_max}


def get_open_shut_fractions(dict_values, realisation_count):
    '''
    Takes 2D array of open/shut/missing as input, and total number of realisations.
    Calculates the fraction of open and shut for each time step.
    '''
    values = []
    for r, d in dict_values.items():
        values.append(d)

    # get rid of the negative "shut"-values
    open_count = np.maximum(np.asarray(values), 0)
    # sum over realisations
    open_count_reduced = open_count.sum(axis=0) / float(realisation_count)

    shut_count = np.maximum(np.asarray(values)*(-1.), 0)
    # sum over realisations
    shut_count_reduced = shut_count.sum(axis=0) / float(realisation_count)

    # fraction of open/shut realisations
    return {
        'open': np.asarray(open_count_reduced, dtype=np.float64),
        'shut': np.asarray(shut_count_reduced, dtype=np.float64)
    }


def extract_well_completions(df, layer_to_zone, time_steps, realisations):
    '''
    Input:
      Pandas data frame for one well.
      Map from layer index to zone name.
      All time steps (sorted).
      All realisations.

    Returns completion time-series for the well aggreated over realisations.
    '''
    completions = get_completions_by_zone(
        df, layer_to_zone, time_steps, realisations)

    result = {}
    for zone_name, comps in completions.items():
        series = get_open_shut_fractions(comps['opsh'], len(realisations))
        series.update(get_kh_stats_series(comps['kh']))

        formatted_time_series = compress_time_series(series)
        if formatted_time_series is not None:
            result[zone_name] = formatted_time_series
    return result


def extract_wells(df, layer_to_zone, time_steps, realisations):
    well_list = []
    for well_name, well_group in df.groupby('WELL'):
        well = {}
        well['name'] = well_name

        comp = extract_well_completions(well_group, layer_to_zone,
                                        time_steps, realisations)

        # stratigraphic sorting of completions
        sorted_comp = {}
        for zname in layer_to_zone.values():
            try:
                sorted_comp[zname] = comp[zname]
            except KeyError:
                pass

        well['completions'] = sorted_comp
        well_list.append(well)
    return well_list


def random_color_str():
    r = random.randint(8, 15)
    g = random.randint(8, 15)
    b = random.randint(8, 15)
    s = hex((r << 8) + (g << 4) + b)
    return "#" + s[-3:]


def extract_stratigraphy(zone_names):
    result = []
    for zone_name in zone_names:
        zdict = {}
        zdict['name'] = zone_name
        zdict['color'] = random_color_str()
        result.append(zdict)
    return result


def create_well_completion_dict(filename):

    # identify all time steps in the dataframe
    time_steps = sorted(pandas.unique(df['DATE']))

    # and all realisations
    realisations = np.asarray(
        sorted(pandas.unique(df['REAL'])), dtype=np.int32)

    layers = np.sort(pandas.unique(df['K1']))

    # construct a map from layer to zone name
    # NOTE: multiple layers mapped to the same zone should work, but not tested...
    layer_to_zone = {}
    zone_names = []
    for layer in layers:
        zone_name = 'zone' + str(layer)
        layer_to_zone[layer] = zone_name
        zone_names.append(zone_name)

    result = {}
    result['stratigraphy'] = extract_stratigraphy(zone_names)
    result['timeSteps'] = time_steps
    result['wells'] = extract_wells(
        df, layer_to_zone, time_steps, realisations)
    return result


def add_well_attributes(wells):
    '''
    Adds some random well attributes.
    '''
    well_type = ['Injector', 'Producer']
    well_region = ['', 'Region 1', 'Region 2', 'Region 3', 'Region 4']
    well_user_group = ['', 'my group 1', 'my group 2']

    for well in wells:
        attributes = {}

        attributes['type'] = random.choice(well_type)
        attributes['region'] = random.choice(well_region)
        choice = random.choice(well_user_group)
        if choice:
            attributes['user defined category'] = choice

        well['attributes'] = attributes


if __name__ == '__main__':
    # fixed seed to avoid different colors between runs
    random.seed(1234)
    filename = 'compdat.csv'
    df = pandas.read_csv(filename)
    result = create_well_completion_dict(df)
    add_well_attributes(result['wells'])
    # json_str = json.dumps(result)

    # more human friendly output:
    json_str = json.dumps(result, indent=2)
    print(json_str)