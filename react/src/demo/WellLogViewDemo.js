import React, { Component } from "react";
import WellLogView from "../lib/components/WellLogView";

// Data files from https://jsonwelllogformat.org/viewer
import data0 from "./example-data/L898MUD.json";
import data1 from "./example-data/WL_RAW_AAC-BHPR-CAL-DEN-GR-MECH-NEU-NMR-REMP_MWD_3.json"; 
import data2 from "./example-data/WLC_PETRO_COMPUTED_OUTPUT_1.json";
import data3 from "./example-data/FM_PRESS_RAW_RUN5_MWD_3.json";

//import data from "./example-data/volve_logs_with_md.json";

const examples=[data0, data1, data2, data3];

class WellLogViewDemo extends Component {
    constructor(props)
    {
        super(props)        
        this.state = {
            example: 0
        };
    }

    getData(example)
    {
        let data=examples[example];
        return data;
    }

    onChange(ev)  {
        this.setState({      
            example: ev.target.id
        });
    }
        
    render() {
      return (
        <div>
          <div align='center'>
            Data file: 
            <input type='radio' id='0' checked={this.state.example == 0} onChange={this.onChange.bind(this)} />1 
            <input type='radio' id='1' checked={this.state.example == 1} onChange={this.onChange.bind(this)} />2
            <input type='radio' id='2' checked={this.state.example == 2} onChange={this.onChange.bind(this)} />3 
            <input type='radio' id='3' checked={this.state.example == 3} onChange={this.onChange.bind(this)} />4 
          </div>
          <WellLogView id="well_log_view" data={this.getData(this.state.example)} />
        </div>
      );
    }
}


export default WellLogViewDemo;
