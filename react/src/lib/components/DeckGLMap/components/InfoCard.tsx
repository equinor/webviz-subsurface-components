import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Collapse from "@material-ui/core/Collapse";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

import { Button, Icon } from "@equinor/eds-core-react";
import { arrow_drop_up, arrow_drop_down } from "@equinor/eds-icons";

import { PickInfo } from "@deck.gl/core/lib/deck";
import { LayerPickInfo, PropertyDataType } from "../layers/utils/layerTools";
import { PropertyMapPickInfo } from "../layers/utils/propertyMapTools";

Icon.add({ arrow_drop_up, arrow_drop_down });

interface InfoCardDataType {
    layerName: string;
    properties: PropertyDataType[];
}

interface InfoCardProps {
    pickInfos: PickInfo<unknown>[];
}

const useStyles = makeStyles({
    table: {
        "& > *": {
            backgroundColor: "#ffffffcc",
            border: "2px solid #ccc",
            padding: "0px",
            borderRadius: "5px",

            position: "absolute",
            bottom: 0,
        },
    },
    icon_style: {
        border: "none",
        padding: 0,
        width: "20px",
    },
    table_row: {
        "& > *": {
            padding: 0,
        },
    },
});

function Row(props: { layer_data: InfoCardDataType }) {
    const { layer_data } = props;
    const [open, setOpen] = React.useState(true);
    const classes = useStyles();

    return (
        <React.Fragment>
            <TableRow className={classes.table_row}>
                <TableCell className={classes.icon_style}>
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
                </TableCell>
                <TableCell> {layer_data.layerName} </TableCell>
            </TableRow>
            <TableRow className={classes.table_row}>
                <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={2}
                >
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Table size="small" aria-label="properties">
                            <TableBody>
                                {layer_data.properties.map((propertyRow) => (
                                    <TableRow
                                        key={propertyRow.name}
                                        className={classes.table_row}
                                    >
                                        <TableCell
                                            style={{
                                                border: "none",
                                                paddingLeft: 10,
                                                paddingRight: 10,
                                            }}
                                        >
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
                                                ? propertyRow.value?.toFixed(2)
                                                : propertyRow.value}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

const InfoCard: React.FC<InfoCardProps> = (props: InfoCardProps) => {
    const [infoCardData, setInfoCardData] =
        React.useState<InfoCardDataType[] | null>(null);

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
            setInfoCardData(null);
            return;
        }

        const xy_properties: PropertyDataType[] = [];
        xy_properties.push({ name: "x", value: topObject.coordinate[0] });
        xy_properties.push({ name: "y", value: topObject.coordinate[1] });

        const infoCardData: InfoCardDataType[] = [];
        infoCardData.push({
            layerName: "Position",
            properties: xy_properties,
        });

        props.pickInfos.forEach((info) => {
            const layer_props = (info as LayerPickInfo)?.property;
            const data = infoCardData.find(
                (item) => item.layerName === info.layer?.id
            );
            if (layer_props) {
                if (data) {
                    data.properties.push(layer_props);
                } else {
                    infoCardData.push({
                        layerName: info.layer?.id || "unknown-layer",
                        properties: [layer_props],
                    });
                }
            }

            const zValue = (info as PropertyMapPickInfo).propertyValue;
            if (zValue) {
                xy_properties.push({ name: info.layer.id, value: zValue });
            }
        });

        setInfoCardData(infoCardData);
    }, [props.pickInfos]);

    const classes = useStyles();
    return (
        infoCardData && (
            <TableContainer component={Paper}>
                <Table aria-label="info card" className={classes.table}>
                    <TableBody>
                        {infoCardData.map((card_data) => (
                            <Row
                                key={card_data.layerName}
                                layer_data={card_data}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )
    );
};

export default InfoCard;
