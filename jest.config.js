/* eslint-disable import/no-default-export */

export default {
  testEnvironment: 'jest-environment-node',
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  modulePaths: [ '<rootDir>' ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: ['/node_modules/'],
};
