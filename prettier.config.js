module.exports = {
    tabWidth: 4,
    trailingComma: "es5",
    endOfLine: "crlf",
    overrides: [
        // `nx release version` overwrites package.json with 2
        // spaces indentation
        { files: "typescript/**/package.json", options: { tabWidth: 2 } },
    ],
};
