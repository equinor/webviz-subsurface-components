import geojson
import xtgeo
import flask


def xtgeo_wells_to_geojson(wells: xtgeo.Wells) -> str:
    validate_geometry = True
    feature_arr = []
    for well in wells:
        x_arr = well.dataframe["X_UTME"].values
        y_arr = well.dataframe["Y_UTMN"].values
        z_arr = -well.dataframe["Z_TVDSS"].values
        md_arr = well.dataframe[well.mdlogname].values

        coords = list(zip(x_arr, y_arr, z_arr))

        point = geojson.Point(
            coordinates=[coords[0][0], coords[0][1], coords[0][2]],
            validate=validate_geometry,
        )
        line = geojson.LineString(coordinates=coords[1:], validate=validate_geometry)
        geocoll = geojson.GeometryCollection(geometries=[point, line])

        feature = geojson.Feature(
            id=well.name,
            geometry=geocoll,
            properties={"name": well.name, "md": [list(md_arr[1:])]},
        )
        feature_arr.append(feature)

    featurecoll = geojson.FeatureCollection(features=feature_arr)
    response = flask.Response(
        geojson.dumps(featurecoll), mimetype="application/geo+json"
    )

    return response
