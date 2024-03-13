import "jest";

import type { Config } from "./configTools";
import { findConfig } from "./configTools";

describe("Test Config tools", () => {
    it("findConfig on empty config", () => {
        expect(findConfig({}, "root")).toBe(undefined);
        expect(findConfig({}, "root/key")).toBe(undefined);
        expect(findConfig({}, ["root"])).toBe(undefined);
        expect(findConfig({}, ["root", "key"])).toBe(undefined);
        // with fallback
        expect(findConfig({}, "root", "fallback")).toBe(undefined);
        expect(findConfig({}, "root", ["fallback"])).toBe(undefined);
        expect(findConfig({}, ["root"], "fallback")).toBe(undefined);
        expect(findConfig({}, ["root"], ["fallback"])).toBe(undefined);
        expect(findConfig({}, "root/key", "fallback")).toBe(undefined);
        expect(findConfig({}, "root/key", ["fallback"])).toBe(undefined);
        expect(findConfig({}, ["root", "key"], "fallback")).toBe(undefined);
        expect(findConfig({}, ["root", "key"], ["fallback"])).toBe(undefined);
    });

    it("findConfig on config", () => {
        const config: Config = {
            root: {
                key: "root_key",
                sub: {
                    key: "root_sub_key",
                },
            },
            key: "key",
        };
        expect(findConfig(config, "key")).toBe("key");
        expect(findConfig(config, ["key"])).toBe("key");

        expect(findConfig(config, "root/key")).toBe("root_key");
        expect(findConfig(config, ["root", "key"])).toBe("root_key");

        expect(findConfig(config, "root/sub/key")).toBe("root_sub_key");
        expect(findConfig(config, ["root", "sub", "key"])).toBe("root_sub_key");

        expect(findConfig(config, "root/key2")).toBe(undefined);
        expect(findConfig(config, ["root", "key2"])).toBe(undefined);

        expect(findConfig(config, "root2/key")).toBe(undefined);
        expect(findConfig(config, ["root2", "key"])).toBe(undefined);
        // with fallback
        expect(findConfig(config, "key", "root/key")).toBe("key");
        expect(findConfig(config, "key", "root/nokey")).toBe("key");
        expect(findConfig(config, "root/key", "key")).toBe("root_key");
        expect(findConfig(config, "root/key", "nokey")).toBe("root_key");
        expect(findConfig(config, "no/key", "root/key")).toBe("root_key");
        expect(findConfig(config, "no/key", "root/nokey")).toBe(undefined);
    });

    it("findConfig on config with objects", () => {
        const configValue = {
            value: "val",
            other: "other",
        };
        const configValue2 = {
            value: "val2",
        };
        const config: Config = {
            root: {
                key: configValue,
                sub: {
                    key: configValue2,
                },
            },
        };
        expect(findConfig(config, "root/key")).toStrictEqual(configValue);
        expect(findConfig(config, ["root", "key"])).toStrictEqual(configValue);

        expect(findConfig(config, "root/sub/key")).toStrictEqual(configValue2);
        expect(findConfig(config, ["root", "sub", "key"])).toStrictEqual(
            configValue2
        );
        // with fallback
        expect(findConfig(config, "root/key", "no/key")).toStrictEqual(
            configValue
        );
        expect(findConfig(config, "root/key", "root/sub/key")).toStrictEqual(
            configValue
        );
        expect(findConfig(config, "no/key", "root/key")).toStrictEqual(
            configValue
        );
        expect(findConfig(config, "root/key", "root/sub/key")).toStrictEqual(
            configValue
        );
        expect(findConfig(config, "root/sub/key", "root/key")).toStrictEqual({
            value: "val2",
            other: "other",
        });
    });
});
