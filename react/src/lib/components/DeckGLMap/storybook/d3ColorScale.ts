import * as d3 from "d3";

export const d3ColorScales = [
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
  {
    "name": "Accent",
    "discrete": true,
    "colors": d3.schemeAccent
  },
  {
    "name": "Dark2",
    "discrete": true,
    "colors": d3.schemeDark2
  },
  {
    "name": "Paired",
    "discrete": true,
    "colors": d3.schemePaired
  },
  {
    "name": "Pastel1",
    "discrete": true,
    "colors": d3.schemePastel1
  },
  {
    "name": "Pastel2",
    "discrete": true,
    "colors": d3.schemePastel2
  },
  {
    "name": "Set1",
    "discrete": true,
    "colors": d3.schemeSet1
  },
  {
    "name": "Set2",
    "discrete": true,
    "colors": d3.schemeSet3
  },
  {
    "name": "Set3",
    "discrete": true,
    "colors": d3.schemeSet3
  },
  {
    "name": "Tableau10",
    "discrete": true,
    "colors": d3.schemeTableau10
  },
  {
    "name": "Category10",
    "discrete": true,
    "colors": d3.schemeCategory10
  },
]