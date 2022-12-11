import React from "react";
import Home from "@arcgis/core/widgets/Home";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";

export default function Widgets({ view }: any): JSX.Element {
    React.useEffect(() => {
        // home widget
        const homeWidget = new Home({ view });
        view?.ui.add(homeWidget, "top-left");

        // scale bar widget
        const scaleBarWidget = new ScaleBar({ view });
        view?.ui.add(scaleBarWidget, "bottom-left");
    }, [view]);

    return <></>;
}
