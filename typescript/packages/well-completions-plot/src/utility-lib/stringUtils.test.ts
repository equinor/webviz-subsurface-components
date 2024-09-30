import { createWellNameRegexMatcher } from "./stringUtils";

describe("createWellNameRegexMatcher", () => {
    it("should match strings starting with same characters", () => {
        const matcher = createWellNameRegexMatcher("A2");
        expect(matcher("a2")).toBe(true);
        expect(matcher("A2")).toBe(true);
        expect(matcher("R_A2")).toBe(true);
    });

    it("should handle special character '?'", () => {
        const matcher = createWellNameRegexMatcher("?A2");
        expect(matcher("RA2")).toBe(true);
        expect(matcher("R_A2")).toBe(true);
        expect(matcher("2")).toBe(false);
        expect(matcher("A2")).toBe(false);
    });

    it("should handle special character '*'", () => {
        const matcher = createWellNameRegexMatcher("*A2");
        expect(matcher("A2")).toBe(true);
        expect(matcher("RA2")).toBe(true);
        expect(matcher("R_A2")).toBe(true);
        expect(matcher("2")).toBe(false);
    });

    it("should handle escape characters", () => {
        const matcher = createWellNameRegexMatcher("te\\+t");
        expect(matcher("te+t")).toBe(true);
        expect(matcher("te\\+t")).toBe(false);
    });

    it("should handle mixed special and escape characters", () => {
        const matcher = createWellNameRegexMatcher("te?t\\+");
        expect(matcher("test+")).toBe(true);
        expect(matcher("text+")).toBe(true);
        expect(matcher("te!t+")).toBe(true);
    });

    it("should return true for empty pattern", () => {
        const matcher = createWellNameRegexMatcher("");
        expect(matcher("anything")).toBe(true);
        expect(matcher("")).toBe(true);
    });

    it("should handle invalid regex patterns gracefully", () => {
        const matcher = createWellNameRegexMatcher("[");
        expect(matcher("anything")).toBe(false);
    });
});
