import React from "react";
import {
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from "@mui/material";
import { Button, Icon } from "@equinor/eds-core-react";
import { arrow_drop_up, arrow_drop_down } from "@equinor/eds-icons";
import { styled } from "@mui/system";

import {
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
} from "../layers/utils/layerTools";
import { rgb } from "d3-color";

Icon.add({ arrow_drop_up, arrow_drop_down });

interface InfoCardDataType {
    layerName: string;
    properties?: PropertyDataType[];
}

export interface InfoCardProps {
    /**
     * List of JSON object describing picking information of layers
     * that are under the cursor.
     */
    pickInfos: LayerPickInfo[];
}

const roundToSignificant = function (num: number) {
    // Returns two significant figures (non-zero) for numbers with an absolute value less
    // than 1, and two decimal places for numbers with an absolute value greater
    // than 1.
    return parseFloat(
        num.toExponential(Math.max(1, 2 + Math.log10(Math.abs(num))))
    );
};

const StyledTable = styled(Table)({
    "& > *": {
        backgroundColor: "#ffffffcc",
        color: "#000000ff",
        border: "2px solid #ccc",
        padding: "0px",
        borderRadius: "5px",
        position: "absolute",
        bottom: 0,
        left: 0,
        marginLeft: "3px",
        marginBottom: "3px",
    },
});

const StyledTableCell = styled(TableCell)({
    border: "none",
    padding: 0,
    width: "20px",
});

const StyledTableRow = styled(TableRow)({
    "& > *": {
        padding: 0,
    },
});

function Row(props: { layer_data: InfoCardDataType }) {
    const { layer_data } = props;
    const [open, setOpen] = React.useState(true);

    if (layer_data.properties?.length == 0) return null;
    return (
        <React.Fragment>
            <StyledTableRow>
                <StyledTableCell>
                    <Button
                        style={{ padding: 0 }}
                        variant="ghost"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? (
                            <Icon color="currentColor" name="arrow_drop_up" />
                        ) : (
                            <Icon color="currentColor" name="arrow_drop_down" />
                        )}
                    </Button>
                </StyledTableCell>
                <TableCell> {layer_data.layerName} </TableCell>
            </StyledTableRow>
            <StyledTableRow>
                <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={2}
                >
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Table size="small" aria-label="properties">
                            <TableBody>
                                {layer_data.properties?.map((propertyRow) => (
                                    <StyledTableRow key={propertyRow.name}>
                                        <TableCell
                                            style={{
                                                border: "none",
                                                paddingLeft: 10,
                                                paddingRight: 10,
                                            }}
                                        >
                                            {propertyRow.color && (
                                                <span
                                                    style={{
                                                        color: rgb(
                                                            ...(propertyRow.color as [
                                                                number,
                                                                number,
                                                                number,
                                                                number?
                                                            ])
                                                        ).toString(),
                                                    }}
                                                >
                                                    {"\u2B24"}
                                                </span>
                                            )}
                                            {propertyRow.name}
                                        </TableCell>
                                        <TableCell
                                            style={{
                                                border: "none",
                                                textAlign: "right",
                                            }}
                                        >
                                            {typeof propertyRow.value ==
                                            "number"
                                                ? roundToSignificant(
                                                      propertyRow.value
                                                  )
                                                : propertyRow.value}
                                        </TableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Collapse>
                </TableCell>
            </StyledTableRow>
        </React.Fragment>
    );
}

const InfoCard: React.FC<InfoCardProps> = (props: InfoCardProps) => {
    const [infoCardData, setInfoCardData] = React.useState<
        InfoCardDataType[] | null
    >(null);

    React.useEffect(() => {
        if (props.pickInfos.length === 0) {
            setInfoCardData(null);
            return;
        }
        const topObject = props.pickInfos[0];
        if (
            topObject.coordinate === undefined ||
            topObject.coordinate.length < 2
        ) {
            return;
        }

        const xy_properties: PropertyDataType[] = [];
        xy_properties.push({
            name: "x",
            value: Number(topObject.coordinate[0]).toFixed(2).toString() + " m",
        });
        xy_properties.push({
            name: "y",
            value: Number(topObject.coordinate[1]).toFixed(2).toString() + " m",
        });

        const info_card_data: InfoCardDataType[] = [];
        info_card_data.push({
            layerName: "Position",
            properties: xy_properties,
        });

        props.pickInfos.forEach((info) => {
            const layer_properties = info.properties;
            const layer_name = (
                info.layer?.props as unknown as ExtendedLayerProps
            )?.name;

            // pick info can have 2 types of properties that can be displayed on the info card
            // 1. defined as propertyValue, used for general layer info (now using for positional data)
            // 2. Another defined as array of property object described by type PropertyDataType

            // collecting card data for 1st type
            const zValue = (info as LayerPickInfo).propertyValue;
            if (typeof zValue !== "undefined") {
                const property = xy_properties.find(
                    (item) => item.name === layer_name
                );
                if (property) {
                    property.value = zValue;
                } else {
                    xy_properties.push({
                        name: layer_name,
                        value: zValue,
                    });
                }
            }

            // collecting card data for 2nd type
            const layer = info_card_data.find(
                (item) => item.layerName === layer_name
            );
            if (layer) {
                layer_properties?.forEach((layer_prop) => {
                    const property = layer.properties?.find(
                        (item) => item.name === layer_prop.name
                    );
                    if (property) {
                        property.value = layer_prop.value;
                    } else {
                        layer.properties?.push(layer_prop);
                    }
                });
            } else {
                info_card_data.push({
                    layerName: layer_name || "unknown-layer",
                    properties: layer_properties,
                });
            }
        });

        setInfoCardData(info_card_data);
    }, [props.pickInfos]);

    return (
        infoCardData && (
            <TableContainer>
                <StyledTable aria-label="info-card">
                    <TableBody>
                        {infoCardData.map(
                            (card_data) =>
                                card_data.properties && (
                                    <Row
                                        key={card_data.layerName}
                                        layer_data={card_data}
                                    />
                                )
                        )}
                    </TableBody>
                </StyledTable>
            </TableContainer>
        )
    );
};

export default InfoCard;
