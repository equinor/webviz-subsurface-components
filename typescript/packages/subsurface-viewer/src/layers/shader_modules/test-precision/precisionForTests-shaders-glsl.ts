const TEST_PRECISION = /* glsl */ `\
// Enforce high precision for shaders for tests which are performed in a docker container

precision highp float;
`;

const PROD_PRECISION = /* glsl */ `\
`;

const mode =
    process.env["STORYBOOK_NODE_ENV"] ??
    process.env["CYPRESS_NODE_ENV"] ??
    process.env["NODE_ENV"];

const PRECISION = mode !== "production" ? TEST_PRECISION : PROD_PRECISION;

export { PRECISION };
