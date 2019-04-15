import * as d3 from 'd3';

export default (domain) => {
  const ctable = [[0.0, "rgb(0,255,255)"], [0.2627450980392157, "rgb(2,2,249)"], [0.29411764705882354, "rgb(20,19,195)"], [0.38823529411764707, "rgb(69,66,66)"], [0.43529411764705883, "rgb(114,109,109)"], [0.45098039215686275, "rgb(143,137,136)"], [0.5137254901960784, "rgb(195,188,186)"], [0.5450980392156862, "rgb(178,155,133)"], [0.5764705882352941, "rgb(163,125,87)"], [0.6392156862745098, "rgb(139,69,0)"], [0.7647058823529411, "rgb(255,85,0)"], [1.0, "rgb(255,247,0)"]]
    .reverse().map(d => [1 - d[0], d[1] ]);
  const cscale = d3.scaleLinear()
    .range(ctable.map(d => d[1])).domain(ctable.map(d => d[0]));
  const vscale = d3.scaleLinear().domain(domain).range([0, 1]).clamp(true);
  const scale = t => cscale(vscale(t));

  return scale;
}