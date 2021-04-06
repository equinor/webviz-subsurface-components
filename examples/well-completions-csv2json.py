import pandas
import numpy as np
import random
import json


def get_time_series(df, time_steps):
    """
    Creates a time series with a value for each time step in the form
    [0,0,0,1,1,1,1,-1,-1,-1]
    '0' means no event, '1' is open, '-1' is shut.
    The input data frame is assumed to contain data for single well,
    single zone, single realisation.
    """
    if df.shape[0] == 0:
        return [0] * len(time_steps)

    result = []
    d = df.sort_values(by=["DATE"])

    is_open = 0
    c = 0
    t0 = d["DATE"].iat[0]
    for t in time_steps:
        if t == t0:
            v = d["OP/SH"].iat[c]
            if v == "OPEN":
                is_open = 1
            elif v == "SHUT":
                is_open = -1
            c += 1
            if c < d.shape[0]:
                t0 = d["DATE"].iat[c]
        result.append(is_open)
    return result


def time_series_to_string(series):
    r = ""
    for o in series:
        c = "."
        if o == 1:
            c = "o"
        elif o == -1:
            c = "s"
        r += c
    return r


def num_series_to_string(series):
    r = ""
    for o in series:
        c = "."
        if o > 0:
            c = str(o)
        r += c
    return r


def completions_to_strings(completions, open_count_reduced):
    completion_strings = []
    for r in completions:
        s = ""
        for layer in r:
            s += "/"
            s += time_series_to_string(layer)
        completion_strings.append(s)

    s = ""
    for layer in open_count_reduced:
        s += "/"
        s += num_series_to_string(layer)
    completion_strings.append(s)
    return completion_strings


def get_completions(df, layers, time_steps, realisations):
    """
    Extracts completions into a list of lists.
    Full matrix - every time step and realisation.
    """
    completions = []
    for rname, realdata in df.groupby("REAL"):
        real = []
        for layer in layers:
            # TODO: map multiple layers to zone
            data = realdata.loc[realdata["K1"] == layer]
            real.append(get_time_series(data, time_steps))
        completions.append(real)
    return completions


def format_time_series(time_series):
    """
    The function compresses the fraction of completed realisation into a more compact form:
    [0, 0, 0, 0.25, 0.25, 1.0, 1.0] -> { t: [3, 5], f: [0.25, 1.0] }
    t is a list of list of time steps where the fraction changes,
    f is the corresponding open fraction.
    """
    time_steps = []
    values = []
    n = len(time_series)
    v0 = time_series[0]
    if v0 > 0.0:
        time_steps.append(0)
        values.append(v0)
    for i in range(1, n):
        v = time_series[i]
        if v != v0:
            time_steps.append(i)
            values.append(v)
            v0 = v

    if len(time_steps) == 0:
        return None
    r = {}
    r["t"] = time_steps
    r["f"] = values
    return r


def extract_well(df, well, layers, zone_names, time_steps, realisations):
    well_dict = {}
    well_dict["name"] = well

    completions = get_completions(df, layers, time_steps, realisations)

    # get rid of the negative "shut"-values
    open_count = np.maximum(np.asarray(completions), 0)
    open_count_reduced = open_count.sum(axis=0)  # sum over realisations
    #    shut_count = np.maximum(np.asarray(completions) * (-1), 0)
    #    shut_count_reduced = shut_count.sum(axis=0)

    # convert to string - for debugging
    if False:
        completion_strings = completions_to_strings(completions, open_count_reduced)
        well_dict["debug"] = completion_strings

    # calculate fraction of open realisations
    open_frac = np.asarray(open_count_reduced, dtype=np.float64) / float(
        len(realisations)
    )

    result = {}
    for zone_name, time_series in zip(zone_names, open_frac):
        r = format_time_series(time_series)
        if r is not None:
            result[zone_name] = r
    well_dict["completions"] = result

    # TODO: Should make some more interesting well attributes
    well_dict["type"] = "Producer"
    well_dict["region"] = "Region1"
    return well_dict


def extract_wells(df, layers, zone_names, time_steps, realisations):
    well_list = []
    for name, well_group in df.groupby("WELL"):
        well_list.append(
            extract_well(well_group, name, layers, zone_names, time_steps, realisations)
        )
    return well_list


def random_color_str():
    r = random.randint(8, 15)  # nosec - bandit B311
    g = random.randint(8, 15)  # nosec - bandit B311
    b = random.randint(8, 15)  # nosec - bandit B311
    s = hex((r << 8) + (g << 4) + b)
    return "#" + s[-3:]


def extract_stratigraphy(layers):
    result = []
    for layer in layers:
        zdict = {}
        zdict["name"] = "zone" + str(layer)
        zdict["color"] = random_color_str()
        result.append(zdict)
    return result


# fixed seed to avoid different colors between runs
random.seed(1234)
df = pandas.read_csv("compdat.csv")

time_steps = sorted(pandas.unique(df["DATE"]))

realisations = np.asarray(sorted(pandas.unique(df["REAL"])), dtype=np.int32)

layers = np.sort(pandas.unique(df["K1"]))

result = {}
result["stratigraphy"] = extract_stratigraphy(layers)
result["time_steps"] = time_steps

zone_names = [a["name"] for a in result["stratigraphy"]]
result["wells"] = extract_wells(df, layers, zone_names, time_steps, realisations)

json_str = json.dumps(result)

# more human friendly output:
# json_str = json.dumps(result, indent=2)

print(json_str)
