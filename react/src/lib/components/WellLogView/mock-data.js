import { range } from 'd3';

const domain = [0, 1500];
export const ex1 = range(domain[0], domain[1], 10).map(d => [d, Math.random()]);

export const ex2 = {
  noise: range(domain[0], domain[1]).map(d => [d, Math.random() * 90]),
  noise2: range(domain[0], domain[1]).map(d => [d, Math.random() * 20])
};

const sin = range(domain[0], domain[1]).map(d => [d, Math.sin((d / 2000) * Math.PI * 2 * 20) * 25 + 50]);
export const ex3 = {
  sin,
  noise: sin.map(v => [v[0], v[1] * Math.random() + 35]),
};
