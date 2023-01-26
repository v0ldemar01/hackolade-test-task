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
3. PS: This app uses ```typescript``` with ```esm``` support. There is no oficial solution for handling path mapping from ```ts-node```. So dependency ```ts-paths-esm-loader``` is the partial try of solution. With ```patch-package``` was created the diff with solves the issue of esm modules of .js file extensions.
The [issue](https://github.com/luanglopes/ts-paths-esm-loader/issues/12)
