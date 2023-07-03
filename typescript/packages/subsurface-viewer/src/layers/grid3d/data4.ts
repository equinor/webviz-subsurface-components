/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-loss-of-precision */
//Pentagonal Antiprism-Trapezohedron Toroid

const C0 = (3 - Math.sqrt(5)) / 4;
const C1 = (Math.sqrt(5) - 1) / 4;
const C2 = (1 + Math.sqrt(5)) / 4;

export const Points = [
 0.5,  0.0,   C2,
 0.5,  0.0,  -C2,
-0.5,  0.0,   C2,
-0.5,  0.0,  -C2,
 0.0,   C2,  0.5,
 0.0,   C2, -0.5,
 0.0,  -C2,  0.5,
 0.0,  -C2, -0.5,
  C2,  0.5,  0.0,
 -C2, -0.5,  0.0,
 0.0,   C0,  0.5,
 0.0,   C0, -0.5,
 0.0,  -C0,  0.5,
 0.0,  -C0, -0.5,
  C1,   C1,   C1,
  C1,   C1,  -C1,
 -C1,  -C1,   C1,
 -C1,  -C1,  -C1,
  C0,  0.5,  0.0,
 -C0, -0.5,  0.0,
];

export const Faces = [
5, 0,  6, 16, 12, 10,
5, 1,  8, 18, 15, 11,
5, 2,  4, 14, 10, 12,
5, 3,  9, 19, 17, 13,
5, 4,  5, 15, 18, 14,
5, 5,  3, 13, 11, 15,
5, 6,  7, 17, 19, 16,
5, 7,  1, 11, 13, 17,
5, 8,  0, 10, 14, 18,
5, 9,  2, 12, 16, 19,
3, 2,  6,  0,
3, 2,  0,  4,
3, 3,  1,  7,
3, 3,  7,  9,
3, 4,  0,  8,
3, 4,  8,  5,
3, 5,  8,  1,
3, 5,  1,  3,
3, 6,  2,  9,
3, 6,  9,  7]