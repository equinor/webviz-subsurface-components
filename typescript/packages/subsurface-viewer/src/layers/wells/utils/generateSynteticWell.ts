export function generateSynteticWell() {
    const well = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                geometry: {
                    type: "GeometryCollection",
                    geometries: [
                        {
                            type: "Point",
                            coordinates: [0, 0],
                        },
                        {
                            type: "LineString",
                            coordinates: [
                                [0, 0, 0],
                                [0, 0, -100],
                                [0, 0, -200],
                                [0, 0, -300],
                                [0, 0, -400],
                                [0, 0, -500],
                                [0, 0, -600],
                                [0, 0, -700],
                                [0, 0, -800],
                            ],
                        },
                    ],
                },
                properties: {
                    name: "wl6",
                    color: [255, 255, 0, 255],
                    md: [[0, 1, 2, 3, 4, 5, 8, 9]],
                },
            },
        ],
    };

    return well;
}
