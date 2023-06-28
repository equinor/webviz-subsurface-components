module.exports = {
  stories: ["../packages/*/src/**/*.stories.mdx", "../packages/*/src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-actions", 
    "@storybook/addon-docs", "@storybook/addon-storysource", "@storybook/addon-mdx-gfm"],
  webpackFinal: config => {
    config.module.rules.push({
      test: /\.scss$/,
      use: ["vue-style-loader", "css-loader", "sass-loader"]
    }, {
      test: /\.(fs|vs).glsl$/i,
      use: ["raw-loader"]
    },
    {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            "presets": [
              [
                "@babel/preset-env",
                {
                  "targets": {
                    "chrome": 100
                  }
                }
              ],
              [
              "@babel/preset-typescript", { "allowNamespaces": true },
              ],
              "@babel/preset-react"
            ],

          }
        },
    },
    );
    return {
      ...config,
      resolve: {
        ...config.resolve,
        fallback: {
          ...config.fallback,
          fs: false,
          tls: false,
          net: false,
          path: false,
          zlib: false,
          http: false,
          https: false,
          crypto: false,
          stream: false
        }
      },
    };
  },
  staticDirs: ["../../example-data"],
  framework: {
    name: "@storybook/react-webpack5",
    options: {}
  },
  docs: {
    autodocs: true
  }
};