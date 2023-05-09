from enum import Enum

import numpy as np


class Curves(str, Enum):
    vsh = "VSH"
    swt = "SWT"
    pres_form = "PRES_FORM"
    net_flag = "NET_FLAG"
    gr = "GR"
    rhob = "RHOB"
    nphi = "NPHI"
    phit = "PHIT"
    klogh = "KLOGH"
    core_plug_poro = "Core plug PORO"
    core_plug_permx = "Core plug PERMX"
    core_plug_permz = "Core plug PERMZ"
    hkl = "HKL"
    md = "MD"
    tvd = "TVD"
    lithofacies = "Lithofacies"


axis_mnemos = {
    "md": ["DEPTH", "DEPT", "MD", "TDEP", "MD_RKB"],
    "tvd": ["TVD", "TVDSS", "DVER", "TVD_MSL"],
    "tstd": ["TST", "TSTD"],
}

templates = [
    {
        "name": "Template 1",
        "scale": {"primary": "md", "allowSecondary": True},
        "tracks": [
            {
                "plots": [
                    {
                        "name": Curves.lithofacies.value,
                        "style": Curves.lithofacies.value,
                    }
                ]
            },
            {
                "plots": [
                    {
                        "name": Curves.lithofacies.value,
                        "style": f"{Curves.lithofacies.value}2",
                    }
                ]
            },
            {
                "plots": [
                    {
                        "name": Curves.vsh.value,
                        "color": "green",
                        "type": "area",
                        "fill": "green",
                        "domain": [0, 1],
                    }
                ]
            },
            {
                "plots": [
                    {
                        "name": Curves.swt.value,
                        "style": Curves.swt.value,
                        "domain": [1.0, 0.0],
                    }
                ]
            },
            {
                "plots": [
                    {
                        "name": Curves.pres_form.value,
                        "style": Curves.pres_form.value,
                        "domain": [200, 500],
                    }
                ]
            },
            {
                "plots": [
                    {
                        "name": Curves.net_flag.value,
                        "style": Curves.net_flag.value,
                        "domain": [0, 20],
                    }
                ]
            },
            {
                "plots": [
                    {
                        "name": Curves.gr.value,
                        "style": Curves.gr.value,
                        "domain": [0, 150],
                    }
                ]
            },
            {
                "plots": [
                    {
                        "name": Curves.rhob.value,
                        "style": Curves.rhob.value,
                        "domain": [0.5, 2.95],
                    }
                ]
            },
            {
                "plots": [
                    {
                        "name": Curves.nphi.value,
                        "style": Curves.nphi.value,
                        "domain": [0.85, -0.15],
                    }
                ]
            },
            {
                "title": "RHOB vs NPHI",
                "plots": [
                    {
                        "name": Curves.rhob.value,
                        "name2": Curves.nphi.value,
                        "type": "differential",
                        "scale": "linear",
                        "color": "red",
                        "color2": "blue",
                        "fill": "grey",
                        "fill2": "yellow",
                    },
                ],
                "domain": [
                    -5.0,
                    5.0,
                ],  # TODO: Looks like domain is not working with "differential" plot. See wsc issue #1453
            },
            {
                "plots": [
                    {"name": Curves.phit.value, "color": "#0000FF"},
                    {
                        "name": Curves.core_plug_poro.value,
                        "style": Curves.core_plug_poro.value,
                    },
                ]
            },
            {
                "plots": [
                    {"name": Curves.klogh.value, "style": Curves.klogh.value},
                    {
                        "name": Curves.core_plug_permx.value,
                        "style": Curves.core_plug_permx.value,
                    },
                    {
                        "name": Curves.core_plug_permz.value,
                        "style": Curves.core_plug_permz.value,
                    },
                ]
            },
        ],
        "styles": [
            {
                "name": Curves.hkl.value,
                "type": "gradientfill",
                "colorTable": "Physics",
                "color": "green",
            },
            {
                "name": Curves.md.value,
                "scale": "linear",
                "type": "area",
                "color": "blue",
                "fill": "green",
            },
            {"name": Curves.swt.value, "scale": "linear", "color": "blue"},
            {
                "name": Curves.net_flag.value,
                "type": "area",
                "color": "#B3B300",
                "fill": "#B3B300",
            },
            {
                "name": Curves.klogh.value,
                "color": "#00008B",
                "scale": "log",
            },
            {"name": Curves.pres_form.value, "color": "black", "type": "dot"},
            {
                "name": Curves.core_plug_poro.value,
                "scale": "linear",
                "color": "black",
                "type": "dot",
            },
            {
                "name": Curves.core_plug_permx.value,
                "scale": "log",
                "color": "black",
                "type": "dot",
            },
            {
                "name": Curves.core_plug_permz.value,
                "scale": "log",
                "color": "red",
                "type": "dot",
            },
            {
                "name": Curves.nphi.value,
                "color": "blue",
            },
            {
                "name": Curves.rhob.value,
                "color": "red",
            },
            {
                "name": Curves.gr.value,
                "type": "gradientfill",
                "colorTable": "YellowDarkGreen",
                "color": "#006400",
            },
            {
                "name": Curves.lithofacies.value,
                "type": "stacked",
                "colorTable": "Stratigraphy",
            },
            {
                "name": f"{Curves.lithofacies.value}2",
                "type": "canvas",
                "colorTable": "Stratigraphy",
            },
        ],
    },
]

wellpick_name = "HORIZON"

stratigraphy_color_table = {
    "name": "Stratigraphy",
    "discrete": True,
    "colorNaN": [255, 64, 64],
    "colors": [
        [0, 255, 120, 61],
        [1, 255, 193, 0],
        [2, 255, 155, 76],
        [3, 255, 223, 161],
        [4, 226, 44, 118],
        [5, 255, 243, 53],
        [6, 255, 212, 179],
        [7, 255, 155, 23],
        [8, 255, 246, 117],
        [9, 255, 241, 0],
        [10, 255, 211, 178],
        [11, 255, 173, 128],
        [12, 248, 152, 0],
        [13, 154, 89, 24],
        [14, 0, 138, 185],
        [15, 82, 161, 40],
        [16, 219, 228, 163],
        [17, 0, 119, 64],
        [18, 0, 110, 172],
        [19, 116, 190, 230],
        [20, 0, 155, 212],
        [21, 0, 117, 190],
        [22, 143, 40, 112],
        [23, 220, 153, 190],
        [24, 226, 44, 118],
        [25, 126, 40, 111],
        [26, 73, 69, 43],
        [27, 203, 63, 42],
        [28, 255, 198, 190],
        [29, 135, 49, 45],
        [30, 150, 136, 120],
        [31, 198, 182, 175],
        [32, 166, 154, 145],
        [33, 191, 88, 22],
        [34, 255, 212, 179],
        [35, 251, 139, 105],
        [36, 154, 89, 24],
        [37, 186, 222, 200],
        [38, 0, 124, 140],
        [39, 87, 84, 83],
    ],
}
color_tables = [
    {
        "name": "Physics",
        "discrete": False,
        "colors": [
            [0, 255, 0, 0],
            [0.25, 255, 255, 0],
            [0.5, 0, 255, 0],
            [0.75, 0, 255, 255],
            [1, 0, 0, 255],
        ],
        "colorNaN": [255, 255, 255],
        "description": "Full options color table",
        "colorBelow": [255, 0, 0],
        "colorAbove": [0, 0, 255],
    },
    {
        "name": "YellowDarkGreen",
        "discrete": False,
        "colors": [[0.0, 255, 255, 0], [1.0, 0, 100, 0]],
        "colorNaN": [255, 255, 255],
        "description": "Full options color table",
        "colorBelow": [255, 0, 0],
        "colorAbove": [0, 0, 255],
    },
    stratigraphy_color_table,
]


# Need to choose between formations or lithology coloring/pattern
wellpick_formations = {
    "name": wellpick_name,
    "colorTables": [stratigraphy_color_table],
    "color": "Stratigraphy",
    "wellpick": {
        "header": {"name": "Set 1", "well": "Well 1"},
        "curves": [
            {
                "name": Curves.md.value,
                "description": None,
                "quantity": "m",
                "unit": "M",
                "valueType": "float",
                "dimensions": 1,
            },
            {
                "name": wellpick_name,
                "description": None,
                "quantity": None,
                "unit": "M",
                "valueType": "string",
                "dimensions": 1,
            },
        ],
        "data": [[1811.0, "FM 1"], [2450.0, "FM 2"], [3200, "FM 3"]],
        "metadata_discrete": {
            wellpick_name: {
                "attributes": ["color", "code"],
                "objects": {
                    "FM 1": [[0, 0, 255, 255], 0],
                    "FM 2": [[0, 255, 0, 255], 1],
                    "FM 3": [[255, 0, 0, 255], 2],
                },
            }
        },
    },
}

archelem_codes = [0, 1, 2]
stratigraphy_color_map = {c[0]: c[1:] for c in stratigraphy_color_table["colors"]}  # type: ignore
pattern_opacity = 255
archelem_start_depths = [1900, 2400, 3000]
last_archelem_end_depth = 3500
archelem_names = ["AE_1", "AE_2", "AE_3"]
wellpicks_lithology = {
    "name": wellpick_name,
    "colorTables": [stratigraphy_color_table],
    "color": "Stratigraphy",
    "wellpick": {
        "header": {"name": "Set 1", "well": "Well 2"},
        "curves": [
            {
                "name": Curves.md.value,
                "quantity": "m",
                "unit": "M",
                "valueType": "float",
                "dimensions": 1,
            },
            {"name": wellpick_name, "valueType": "string", "dimensions": 1},
        ],
        "data": [
            [a, b]
            for a, b in zip(
                archelem_start_depths + [last_archelem_end_depth],
                archelem_names + [archelem_names[-1] + "_stop"],
            )
        ],  # Need dummy at the end to make lower bound for last entry
        "metadata_discrete": {
            wellpick_name: {
                "attributes": ["color", "code"],
                "objects": {
                    archelem_names[lf_code]: [
                        stratigraphy_color_map[lf_code] + [pattern_opacity],
                        lf_code,
                    ]
                    for lf_code in archelem_codes
                },
            }
        },
    },
}
wellpicks = [wellpicks_lithology, wellpicks_lithology]

# Reuse pattern for several to avoid too much gif-images in repo
patterns = [
    [archelem_names[0], 0],
    [archelem_names[1], 1],
    [archelem_names[2], 2],
]

patternsTable = {
    "patternSize": 24,
    "patternImages": [
        "static/Anhydrite.gif",
        "static/Bitumenious.gif",
        "static/Browncoal.gif",
    ],
    "names": [
        "Anhydrite",
        "Bitumenious",
        "Browncoal",
    ],
}

# Do not specify '0' to make this appear as "undefined" in viewer (intentional to test how not defined litho-values look)
lithology_info_table = {
    "codes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    "names": [
        "Anhydrite",
        "Bitumenious",
        "Browncoal",
        "Calcareous Dolostone",
        "Chalk",
        "Clay",
        "Coal",
        "Conglomerate",
        "Diamond_lines",
        "Dolomitic_limestone",
    ],
    "images": [
        "/static/Anhydrite.gif",
        "/static/Bitumenious.gif",
        "/static/Browncoal.gif",
        "/static/Calcareous_dolostone.gif",
        "/static/Chalk.gif",
        "/static/Clay.gif",
        "/static/Coal.gif",
        "/static/Conglomerate.gif",
        "/static/Diamond_lines.gif",
        "/static/Dolomitic_limestone.gif",
    ],
    "colors": [
        [255, 193, 0],
        [255, 155, 76],
        [255, 223, 161],
        [204, 153, 255],
        [101, 167, 64],
        [255, 243, 53],
        [5, 255, 243, 53],
        [6, 255, 212, 179],
        [7, 255, 155, 23],
        [8, 255, 246, 117],
        [9, 255, 241, 0],
        [10, 255, 211, 178],
    ],
}

wellpickFlatting = [None, None]
# wellpickFlatting = [
#     "Litho_"
#   "Hor_2",
#   "Hor_4"
# ]
spacers = [312]

wellDistances = {"units": "m", "distances": [200]}
axisTitles = {"md": Curves.md.value, "tvd": Curves.tvd.value}

nan = np.nan

md_dummy = [
    1513,
    1627,
    1743,
    1857,
    1970,
    2086,
    2199,
    2313,
    2429,
    2542,
    2656,
    2771,
    2885,
    2999,
    3112,
    3228,
    3342,
    3456,
    3572,
]

n = len(md_dummy)  # 19

tvd_dummy = [
    1488,
    1602,
    1716,
    1830,
    1945,
    2058,
    2175,
    2288,
    2402,
    2518,
    2631,
    2744,
    2860,
    2973,
    3088,
    3202,
    3316,
    3432,
    3546,
]

phit_dummy = [
    0.221,
    0.231,
    0.22,
    0.212,
    0.24,
    0.244,
    0.23,
    0.141,
    0.168,
    0.199,
    0.193,
    0.174,
    0.187,
    0.238,
    0.219,
    0.21,
    nan,
    0.17,
    0.167,
]

gr_dummy = [
    33,
    36,
    27.0,
    29.0,
    23.0,
    nan,
    nan,
    34.0,
    33.0,
    28.0,
    31.0,
    29.0,
    23.0,
    26.3,
    24.0,
    27.0,
    32.5,
    80.0,
    99.0,
]

vsh_dummy = [
    0.607,
    0.025,
    0.227,
    0.295,
    0.454,
    0.293,
    0.501,
    0.346,
    0.228,
    0.753,
    0.159,
    0.736,
    0.054,
    0.57,
    0.13,
    0.356,
    0.572,
    0.757,
    0.092,
]

nphi_dummy = [
    0.238,
    0.09,
    0.114,
    0.306,
    0.301,
    0.522,
    0.141,
    0.313,
    0.523,
    0.649,
    nan,
    0.094,
    0.551,
    0.556,
    nan,
    0.267,
    0.176,
    0.287,
    0.221,
]

rhob_dummy = [
    1.949,
    1.599,
    1.689,
    nan,
    2.568,
    2.687,
    2.616,
    2.206,
    2.316,
    1.643,
    2.5,
    1.604,
    2.182,
    1.931,
    nan,
    2.404,
    2.898,
    2.034,
    1.954,
]

swt_dummy = [
    0.51,
    0.472,
    0.134,
    0.786,
    0.524,
    0.851,
    0.468,
    0.136,
    0.351,
    0.627,
    0.217,
    0.136,
    0.825,
    0.295,
    0.781,
    0.268,
    0.423,
    0.934,
    0.809,
]

klogh_dummy = [
    0.027,
    0.041,
    0.122,
    0.014,
    0.05,
    0.015,
    0.037,
    0.031,
    0.01,
    0.15,
    0.011,
    0.272,
    0.035,
    0.029,
    0.025,
    0.031,
    0.184,
    0.022,
    0.14,
]

coreplug_poro_dummy = [
    0.078,
    0.032,
    0.177,
    0.166,
    0.101,
    0.263,
    0.044,
    0.111,
    0.137,
    0.305,
    0.1,
    0.261,
    0.261,
    0.186,
    0.074,
    0.167,
    0.057,
    0.283,
    0.263,
]
coreplug_permx_dummy = [
    9220.508,
    31.435,
    52.207,
    3.242,
    2.401,
    674.43,
    75.688,
    0.181,
    6852.265,
    457.26,
    2504.588,
    7816.093,
    0.109,
    1268.735,
    0.123,
    0.167,
    114.998,
    595.884,
    604.471,
]
coreplug_permz_dummy = [
    985.104,
    1.12,
    0.157,
    0.03,
    1.439,
    0.878,
    1.218,
    4232.84,
    2.315,
    1899.883,
    467.649,
    0.953,
    5.073,
    1.413,
    0.495,
    91.568,
    53.463,
    567.812,
    213.266,
]

lithofacies_dummy = [2, 8, 10, 1, 4, 0, 4, 8, 1, 9, 0, 0, 4, 8, 1, 8, 8, 7, 1]

WELL_NAME = "Well name"
single_well_header = {
    "name": WELL_NAME,
    "well": WELL_NAME,
    "startIndex": md_dummy[0],
    "endIndex": md_dummy[-1],
    "step": 38.086,
}

welllogs_phit_gr_vsh_nphi_rhob_swt_coreplugs = {
    "header": single_well_header,
    "curves": [
        {
            "name": Curves.md.value,
            "description": None,
            "quantity": None,
            "unit": "m",
            "valueType": "float",
            "dimensions": 1,
        },
        {
            "name": Curves.tvd.value,
            "description": None,
            "quantity": None,
            "unit": "m",
            "valueType": "float",
            "dimensions": 1,
        },
        {
            "name": Curves.phit.value,
            "description": None,
            "quantity": None,
            "unit": "",
            "valueType": "float",
            "dimensions": 1,
        },
        {
            "name": Curves.gr.value,
            "description": None,
            "quantity": None,
            "unit": "",
            "valueType": "float",
            "dimensions": 1,
        },
        {
            "name": Curves.vsh.value,
            "description": None,
            "quantity": None,
            "unit": "",
            "valueType": "float",
            "dimensions": 1,
        },
        {
            "name": Curves.nphi.value,
            "description": None,
            "quantity": None,
            "unit": "",
            "valueType": "float",
            "dimensions": 1,
        },
        {
            "name": Curves.rhob.value,
            "description": None,
            "quantity": None,
            "unit": "",
            "valueType": "float",
            "dimensions": 1,
        },
        {
            "name": Curves.swt.value,
            "description": None,
            "quantity": None,
            "unit": "",
            "valueType": "float",
            "dimensions": 1,
        },
        {
            "name": Curves.klogh.value,
            "description": None,
            "quantity": None,
            "unit": "",
            "valueType": "float",
            "dimensions": 1,
        },
        {
            "name": Curves.core_plug_poro.value,
            "description": None,
            "quantity": None,
            "unit": "",
            "valueType": "float",
            "dimensions": 1,
        },
        {
            "name": Curves.core_plug_permx.value,
            "description": None,
            "quantity": None,
            "unit": "",
            "valueType": "float",
            "dimensions": 1,
        },
        {
            "name": Curves.core_plug_permz.value,
            "description": None,
            "quantity": None,
            "unit": "",
            "valueType": "float",
            "dimensions": 1,
        },
        {
            "name": Curves.lithofacies.value,
            "description": "discrete",
            "quantity": "DISC",
            "unit": "DISC",
            "valueType": "integer",
            "dimensions": 1,
        },
    ],
    "data": [
        [
            md,
            tvd,
            phit,
            gr,
            vsh,
            nphi,
            rhob,
            swt,
            klogh,
            cp_poro,
            cp_permx,
            cp_permy,
            facies,
        ]
        for md, tvd, phit, gr, vsh, nphi, rhob, swt, klogh, cp_poro, cp_permx, cp_permy, facies in zip(
            md_dummy,
            tvd_dummy,
            phit_dummy,
            gr_dummy,
            vsh_dummy,
            nphi_dummy,
            rhob_dummy,
            swt_dummy,
            klogh_dummy,
            coreplug_poro_dummy,
            coreplug_permx_dummy,
            coreplug_permz_dummy,
            lithofacies_dummy,
        )
    ],
}

welllogs_two_wells = [
    welllogs_phit_gr_vsh_nphi_rhob_swt_coreplugs,
    welllogs_phit_gr_vsh_nphi_rhob_swt_coreplugs,
]
