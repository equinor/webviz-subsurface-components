module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                targets: {
                    esmodules: true,
                },
            },
        ],
        [
            "@babel/preset-typescript",
            {
                allowNamespaces: true,
                allowDeclareFields: true,
            },
        ],
        "@babel/preset-react",
    ],
};
