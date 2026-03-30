const TEST_PRECISION = /* glsl */ `\
// Enforce high precision for shaders for tests which are performed in a docker container

precision highp float;
`;

const PROD_PRECISION = /* glsl */ `\
`;

export function computePrecision(): string {
    const env = (
        globalThis as {
            process?: { env?: Record<string, string | undefined> };
        }
    ).process?.env;
    const mode =
        env?.["STORYBOOK_NODE_ENV"] ??
        env?.["CYPRESS_NODE_ENV"] ??
        env?.["NODE_ENV"];
    return mode && mode !== "production" ? TEST_PRECISION : PROD_PRECISION;
}

const PRECISION = computePrecision();

export { PRECISION };
