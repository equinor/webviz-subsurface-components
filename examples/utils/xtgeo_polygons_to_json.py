import geojson
import xtgeo
import flask


def xtgeo_polygons_to_geojson(polygons: xtgeo.Polygons, xy_only: bool = False) -> str:
    validate_geometry = True
    feature_arr = []
    for poly_id, poly_df in polygons.dataframe.groupby("POLY_ID"):

        x_arr = poly_df["X_UTME"].values
        y_arr = poly_df["Y_UTMN"].values
        if xy_only:
            coords = list(zip(x_arr, y_arr))
        else:
            z_arr = poly_df["Z_TVDSS"].values
            coords = list(zip(x_arr, y_arr, z_arr))

        line = geojson.LineString(coordinates=coords, validate=validate_geometry)
        geocoll = geojson.GeometryCollection(geometries=[line])

        feature = geojson.Feature(
            id=poly_id,
            geometry=geocoll,
            properties={"name": poly_id},
        )
        feature_arr.append(feature)

    featurecoll = geojson.FeatureCollection(features=feature_arr)
    response = flask.Response(
        geojson.dumps(featurecoll), mimetype="application/geo+json"
    )

    return response
