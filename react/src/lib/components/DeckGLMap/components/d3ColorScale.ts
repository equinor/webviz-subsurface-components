import * as d3 from "d3";

export const colorScalesCont = [
  {
    "name": "Spectral",
    "discrete": false,
    "colors": d3.interpolateSpectral
  },
  {
    "name": "RdYlBu",
    "discrete": false,
    "colors": d3.interpolateRdYlBu
  },
  {
    "name": "Warm",
    "discrete": false,
    "colors": d3.interpolateWarm
  },
  {
    "name": "Cool",
    "discrete": false,
    "colors": d3.interpolateCool
  },
  {
    "name": "Viridis",
    "discrete": false,
    "colors": d3.interpolateViridis
  },
  {
    "name": "Inferno",
    "discrete": false,
    "colors": d3.interpolateInferno
  },
]


// export function interpolatorContinuous(): d3.ScaleSequential<string, never> {
//   return d3.scaleSequential(d3.interpolateInferno);
// };