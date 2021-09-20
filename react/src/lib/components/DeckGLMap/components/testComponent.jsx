import React from "react";
import colorLegend from '../utils/colorLegend';
import * as d3 from 'd3';
import colorbrewer from 'colorbrewer';
import { array } from "jsverify";

class TestComponent extends React.Component {
 
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.legendDemo();
 }

  legendDemo() {
    /* Continous Legend */
    let sampleNumerical = [1,2.5,5,10,20];
    let sampleThreshold=d3.scaleThreshold().domain(sampleNumerical).range(colorbrewer.Reds[5]);
    let horizontalLegend = colorLegend().units("Miles").cellWidth(80).cellHeight(25).inputScale(sampleThreshold).cellStepping(100);

    d3.select("svg").append("g").attr("transform", "translate(50,20)").attr("class", "legend").call(horizontalLegend);

    /* Discrete Legend */
    let itemName = []
    let itemColor = []
    const data = this.props.data

    Object.keys(data).forEach(key => {
        itemColor.push({color: RGBAToHexA(data[key][0])})
        itemName.push(key)
    })

    function RGBAToHexA(rgba) {
       let r = rgba[0].toString(16);
       let g = rgba[1].toString(16);
       let b = rgba[2].toString(16);
       let a = Math.round(rgba[3] * 255).toString(16);
      
        if (r.length == 1)
          r = "0" + r;
        if (g.length == 1)
          g = "0" + g;
        if (b.length == 1)
          b = "0" + b;
        if (a.length == 1)
          a = "0" + a;
      
        return "#" + r + g + b;
      }

    let sampleCategoricalData = itemName
    let sampleOrdinal = d3.scaleOrdinal(d3.schemeCategory10).domain(sampleCategoricalData);
    
    let verticalLegend = colorLegend(itemColor).labelFormat("none").cellPadding(5)
    .orientation("vertical").units("Discrete Legend").cellWidth(25).cellHeight(18).inputScale(sampleOrdinal).cellStepping(10);

    d3.select("svg").append("g").attr("transform", "translate(320,100)").attr("class", "legend").call(verticalLegend);

  }

  render() {

    return (
      <div>
       
      <div id="vizcontainer">
      <svg style={{width:452,height:452,right: 0,top: 0,position: "absolute"}}></svg>
      </div>
      </div>
    );
  }
}

export default TestComponent;