import { capitalizeFirstLetter } from "./stringUtil";

describe("capitalize the first letter", () => {
    it("should capitalize the first letter", () => {
        expect(capitalizeFirstLetter("a")).toEqual("A");
        expect(capitalizeFirstLetter("ABC")).toEqual("ABC");
        expect(capitalizeFirstLetter("aBC")).toEqual("ABC");
        expect(capitalizeFirstLetter("hello world")).toEqual("Hello world");
    });

    it("should do nothing if string is empty", () => {
        expect(capitalizeFirstLetter("")).toEqual("");
    });
});
