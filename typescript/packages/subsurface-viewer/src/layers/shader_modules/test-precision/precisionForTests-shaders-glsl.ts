const TEST_PRECISION = /* glsl */ `\
// Enforce high precision for shaders for tests which are performed in a docker container

precision highp float;
`;

const PROD_PRECISION = /* glsl */ `\
`;

const env = typeof process !== "undefined" ? process.env : undefined;

const mode =
    env?.["STORYBOOK_NODE_ENV"] ??
    env?.["CYPRESS_NODE_ENV"] ??
    env?.["NODE_ENV"];

const PRECISION =
    mode && mode !== "production" ? TEST_PRECISION : PROD_PRECISION;

export { PRECISION };
