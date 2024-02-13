import { merge } from "lodash";

/** Configuration type. */
export type Config = Record<string, unknown>;

/**
 * Returns the merged configuration from path and fallbackPath.
 * Configuration of fallbackPath does not override the configuration from path.
 * @param config configuration.
 * @param path primary path.
 * @param fallbackPath fallback path.
 * @returns
 */
export function findConfig(
    config: Config,
    path: string[] | string,
    fallbackPath: string[] | string | undefined = undefined
): Config | undefined {
    const mainConfig = findConfigImpl(config, path);
    const fallbackConfig = findConfigImpl(config, fallbackPath);
    if (!fallbackConfig) {
        return mainConfig;
    }
    return merge({}, { data: fallbackConfig }, { data: mainConfig }).data;
}

function findConfigImpl(
    config: Config,
    path: string[] | string | undefined
): Config | undefined {
    if (!config || !path) {
        return undefined;
    }
    if (typeof path === "string") {
        path = path.split("/");
    }
    if (path.length === 0) {
        return config;
    }
    const first = path.shift() as string;
    return findConfigImpl(config[first] as Record<string, unknown>, path);
}
