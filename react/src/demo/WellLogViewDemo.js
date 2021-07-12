import React, { Component } from "react";
import WellLogView from "../lib/components/WellLogView";

// Data files from https://jsonwelllogformat.org/viewer
import data0 from "./example-data/L898MUD.json";
import data1 from "./example-data/WL_RAW_AAC-BHPR-CAL-DEN-GR-MECH-NEU-NMR-REMP_MWD_3.json" 
import data2 from "./example-data/WLC_PETRO_COMPUTED_OUTPUT_1.json"
import data3 from "./example-data/FM_PRESS_RAW_RUN5_MWD_3.json" 

//import data from "./example-data/volve_logs_with_md.json";


class WellLogViewDemo extends Component {
    getData(example)
    {
        let data=
            example==0? data0:
            example==1? data1:
            example==2? data2:
                        data3;
        return data;
    }
        
    render() {
        return <WellLogView id="well_log_view" data={this.getData(this.props.example)} />;
    }
}


export default WellLogViewDemo;
