import "jest";
import { describe, expect, it } from "@jest/globals";

import { htmlEscape } from "./htmlEscape";

describe("htmlEscape", () => {
    it("escapes the characters that are significant in HTML", () => {
        expect(htmlEscape("<b>a & b</b>")).toBe("&lt;b&gt;a &amp; b&lt;/b&gt;");
        expect(htmlEscape("\"quoted\" 'single'")).toBe(
            "&quot;quoted&quot; &#39;single&#39;"
        );
    });

    it("leaves plain text untouched", () => {
        expect(htmlEscape("Top Reservoir 2501")).toBe("Top Reservoir 2501");
    });
});
