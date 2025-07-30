const TEST_PRECISION = /* glsl */ `\
// Enforce high precision for shaders for tests which are performed in a docker container

precision highp float;
`;

const PROD_PRECISION = /* glsl */ `\
`;

const PRECISION =
    process.env["NODE_ENV"] !== "production" ? PROD_PRECISION : TEST_PRECISION;

export { PRECISION };
