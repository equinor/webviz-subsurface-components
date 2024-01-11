## How to consume the components

You can install the package in your own project using the [`npmjs` deployed version](https://www.npmjs.com/package/@webviz/subsurface-components):

```
npm install @webviz/subsurface-components
```

In order to consume this package, some loaders for specific file types are required.
Your project needs to be able to load `css` and `scss` files.

### Using Webpack

When using Webpack as a bundler, you can simply add

```json
{
    test: /\.s[ac]ss$/i,
    use: [
        // Creates `style` nodes from JS strings
        "style-loader",
        // Translates CSS into CommonJS
        "css-loader",
        // Compiles Sass to CSS
        "sass-loader",
    ],
}
```

to the module rules in your `webpack.config.js` file. Make sure you have the required `devDependencies` installed:

-   `style-loader` - https://webpack.js.org/loaders/style-loader/
-   `css-loader` - https://www.npmjs.com/package/css-loader
-   `sass-loader` - https://www.npmjs.com/package/sass-loader - requires installation of `sass` as well

### Using Vite

Vite does support both CSS and SCSS/SASS out of the box. You would only need to install `sass`.

```shell
npm i --save-dev sass
```

## How to develop the components

You will first need to install dev dependencies by
```shell
cd ./react
npm ci
```

You can then manually build an components using
```shell
npx nx build <package-name>
```
where package names is either `group-tree`, `subsurface-viewer`, `well-completions` or `well-log-viewer`.

Alternatively you can build all by running e.g.
```shell
npx nx run-many --target build
```

## Testing

Two main testing strategies are used.

### Unit & component tests

Unit and component tests are distributed in package subdirectories as `*.test.ts` and `*.test.tsx` files.

Tests can be run using `npx nx run-many --target test_correctness`.

Test snapshots can be updated using `npx nx run-many --target test_correctness -- --updateSnapshot`.

### Smoke tests

Storybook test-runner is used to smoke test all stories in each package.

Tests can be run, given a running (`npm run storybook`) or static storybook, using `npm run storybook:test`.

Test snapshots can be updated using `npm run storybook:test -- --updateSnapshot`.
