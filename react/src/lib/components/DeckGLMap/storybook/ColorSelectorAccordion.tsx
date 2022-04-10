import * as React from "react";
import { Accordion } from "@equinor/eds-core-react";
import { ColorSelectorWrapper } from "./ColorSelectorWrapper";

export const ColorSelectorAccordion = (props: any) => {
    //console.log("props", props);
    return (
        <div
            className="Container"
            style={{
                width: "316px",
                position: "absolute",
                zIndex: 1,
                top: props.isHorizontal ? 100 : 30,
                right: props.isHorizontal ? 5 : 165,
            }}
        >
            <Accordion>
                <Accordion.Item>
                    <Accordion.Header>Color Scales</Accordion.Header>
                    <Accordion.Panel>
                        <Accordion>
                            <Accordion.Item>
                                <Accordion.Header>
                                    Geologic Color Scale
                                </Accordion.Header>
                                <Accordion.Panel>
                                    <ColorSelectorWrapper
                                        useColorTableColors={true}
                                        useD3Colors={false}
                                        colorScaleObject={props}
                                    />
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                        <Accordion>
                            <Accordion.Item>
                                <Accordion.Header>
                                    D3 Color Scale
                                </Accordion.Header>
                                <Accordion.Panel>
                                    <ColorSelectorWrapper
                                        useD3Colors={true}
                                        useColorTableColors={false}
                                        colorScaleObject={props}
                                    />
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                        <Accordion>
                            <Accordion.Item>
                                <Accordion.Header>
                                    Custom Color Scale
                                </Accordion.Header>
                                <Accordion.Panel>
                                    Custom Content
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </div>
    );
};
