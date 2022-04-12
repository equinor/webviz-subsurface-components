export const sampleLogData = [
    {
        header: {
            name: "EcoScope Data",
            well: "35/12-6S",
            source: "Converted from LIS by Log Studio 4.87 - Petroware AS",
            operator: "Logtek Petroleum",
            startIndex: 2907,
            endIndex: 2908,
            step: 1,
        },
        curves: [
            {
                _wrongName: "MD",
                description: "Measured depth",
                quantity: "length",
                unit: "m",
                valueType: "float",
                dimensions: 1,
            },
            {
                name: "A40H",
                description: "Attenuation resistivity 40 inch",
                quantity: "electrical resistivity",
                unit: "ohm.m",
                valueType: "float",
                dimensions: 1,
            },
        ],
        data: [
            [2907, 29.955],
            [2908, 27.733],
        ],
    },
];

export const sampleWellsData = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                _wrongType: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [437506.854656, 6477887.47091],
                    },
                    {
                        type: "LineString",
                        coordinates: [
                            [437506.85465554806, 6477887.47091465, 25.0],
                            [
                                437505.96268892975, 6477887.532817844,
                                -83.9951103268622,
                            ],
                            [
                                437505.8497621946, 6477887.5323076015,
                                -97.94448791185415,
                            ],
                        ],
                    },
                ],
            },
            properties: {
                name: "15/9-19 A",
                color: [28, 255, 12, 255],
                md: [[0.0, 109.0, 122.94999694824219]],
            },
        },
    ],
};

export const samplePieData = {
    pies: [
        {
            x: 433600,
            y: 6477600,
            R: 100,
            fractions: [
                { value: 99, idx: 0 },
                { value: "65", idx: 1 },
                { value: 67, idx: 2 },
            ],
        },
    ],

    properties: [
        { color: [255, 0, 0], label: "oil" },
        { color: [0, 0, 255], label: "water" },
        { color: [0, 255, 0], label: "gas" },
    ],
};

export const sampleGridData = [
    {
        i: 0,
        j: 11,
        z: 3306.64,
        cs: [
            [432156.53, 6477273.01, -3306.64],
            [432206.44, 6477273.93, -3303.06],
            [432205.61, 6477323.14, -3315.68],
            [432156.53, 6477322.75, -3320.86],
        ],
        vs: [0.0, 1.0, 0.0],
    },
    {
        i: 0,
        j: 12,
        z: 3320.86,
        cs: [
            [432156.53, 6477322.75, -3320.86],
            [432205.61, 6477323.14, -3315.68],
            [432205.27, 6477372.91, -3320.22],
            [432156.53, 6477372.51, -3326.91],
        ],
        vs: 1.0,
    },
];

export const sampleFaultPolygonsData = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [434562, 6477595],
                        [434562, 6478595],
                        // [435062, 6478595],
                        // [435062, 6477595],
                        // [434562, 6477595],
                    ],
                ],
            },
            properties: {
                name: "Top_Hugin:F_52",
                color: [0, 0, 0, 255],
            },
        },
    ],
};

export const sampleColorTable = [
    {
        name: "Physics",
        discrete: false,
        description: "Full options color table",
        colorNaN: [255, 255, 255],
        colorBelow: [255, 0.0, 0.0],
        colorAbove: [0.0, 0.0, 255],
        colors: [
            [0.0, 255, 0.0, 0.0],
            [0.5, 0.0, 255, 0.0],
            [1.0, 0.0, 0.0, 255],
        ],
    },
    {
        name: "Rainbow",
        discrete: "false",
        colors: [
            [0.0, 255, 0.0, 0.0],
            [1.0, 182, 0.0, 182],
        ],
    },
    {
        name: "Colors_set_5",
        discrete: true,
        colors: [
            [0, 244, 237, 255],
            [1, 255, 171, 178],
        ],
    },
];
