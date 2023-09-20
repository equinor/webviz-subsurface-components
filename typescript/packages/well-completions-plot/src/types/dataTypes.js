import PropTypes from "prop-types";
export var SortDirection;
(function (SortDirection) {
    SortDirection["Ascending"] = "Ascending";
    SortDirection["Descending"] = "Descending";
})(SortDirection || (SortDirection = {}));
export var SortBy;
(function (SortBy) {
    SortBy["Name"] = "well name";
    SortBy["StratigraphyDepth"] = "stratigraphy depth";
    SortBy["CompletionDate"] = "earliest comp date";
})(SortBy || (SortBy = {}));
export const SortByEnumToStringMapping = {
    [SortBy.Name]: "Well name",
    [SortBy.StratigraphyDepth]: "Stratigraphy depth",
    [SortBy.CompletionDate]: "Earliest comp date",
};
// ---------------------------  PropTypes ---------------------------------------
const ZoneShape = {
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};
// Note: This is a solution for recursive definition for subzones, as subzones is an optional array of ZoneShape.
// - Object.assign() resolves the issue of subzones being optional.
// - PropTypes.arrayOf(PropTypes.shape(ZoneShape).isRequired) resolves the issue of subzones being recursive.
Object.assign(ZoneShape, {
    subzones: PropTypes.arrayOf(PropTypes.shape(ZoneShape).isRequired),
});
export const ZonePropTypes = PropTypes.shape(ZoneShape).isRequired;
export const AttributeTypePropType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
]);
export const WellInfoPropType = PropTypes.shape({
    name: PropTypes.string.isRequired,
    earliestCompDateIndex: PropTypes.number.isRequired,
    attributes: PropTypes.objectOf(AttributeTypePropType).isRequired,
});
export const UnitsPropType = PropTypes.shape({
    kh: PropTypes.shape({
        unit: PropTypes.string.isRequired,
        decimalPlaces: PropTypes.number.isRequired,
    }).isRequired,
});
//# sourceMappingURL=dataTypes.js.map