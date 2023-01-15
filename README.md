# hackolade-test-task

## Installation

1. Get the latest stable version [Node.js](https://nodejs.org/en/ "Node.js") (LTS). **Note:** npm will be installed automatically. Check the correctness of the installation: to do this, run in the command line (terminal):

  ```js
  node -v  // for checking Node.js version
  npm -v // for checking npm version
  ```
2. In the root of the project, install the dependencies:

  ```js
    npm run install
  ```
3. The project uses typescript with esm support. There is no oficial solution for handling path mapping from ts-node. So dependency ```ts-paths-esm-loader``` is the partial try of solution. But, something else should be changed. Find this package in ```node_modules```, at file ```resolverFactory.js``` include these code lines:
```js

if (specifier.endsWith('.js')) {
  const trimmed = specifier.substring(0, specifier.length - 3)
  const match = matchPath(trimmed)
  if (match) return resolveTs(pathToFileURL(`${match}.js`).href, ctx, defaultResolve)
}
return resolveTs(specifier, ctx, defaultResolve)'
```

## *These actions are only suitable for the test sample, not for the production version!*