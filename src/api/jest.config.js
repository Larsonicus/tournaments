const project = (name) => ({
  displayName: name,
  rootDir: '../..',
  roots: [`<rootDir>/tests/api/${name}`],
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/src/api/tsconfig.json', useESM: true }],
  },
});

export default {
  projects: [project('unit'), project('integration'), project('e2e')],
};
