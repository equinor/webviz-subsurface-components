import * as React from "react";
import { Accordion  } from "@equinor/eds-core-react";
import {ColorSelector} from "./ColorSelectorComponent"

//export const ColorSelectorWrapper = () => {
    export const ColorSelectorWrapper = (props: any) => {
        return (
            <div style={{width: "650px", float: "left", position:"absolute"}}>
                <Accordion >
                    <Accordion.Item>
                        <Accordion.Header>
                            Color Scales
                        </Accordion.Header>
                        <Accordion.Panel>
                            <Accordion >
                                <Accordion.Item>
                                    <Accordion.Header>
                                        Geologic Color Scale
                                    </Accordion.Header>
                                    <Accordion.Panel>
                                        <ColorSelector useColorTableColors={true} useD3Colors={false} parentdata={props}/>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            </Accordion>
                            <Accordion >
                                <Accordion.Item>
                                    <Accordion.Header>
                                        D3 Color Scale
                                    </Accordion.Header>
                                    <Accordion.Panel>
                                        <ColorSelector useColorTableColors={false} useD3Colors={true} parentdata={props}/>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            </Accordion>
                            <Accordion >
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