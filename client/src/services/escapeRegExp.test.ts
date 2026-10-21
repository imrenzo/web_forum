import { EscapeRegExp } from "./escapeRegExp";

test.each(["(", "[", "c++", "*", "?", "a.b", "\\", "{1}", "a|b", "^$"])(
    "search term %p builds a RegExp that matches it literally",
    (term) => {
        const regex = new RegExp(EscapeRegExp(term), "i");
        expect(regex.test(`x ${term} y`)).toBe(true);
    }
);

test("escaped '.' does not act as a wildcard", () => {
    expect(new RegExp(EscapeRegExp("a.b")).test("axb")).toBe(false);
});
