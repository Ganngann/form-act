export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  collectCoverage: true,
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'json-summary', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 58.62,
      functions: 50,
      lines: 48.47,
      statements: 47.25,
    },
  },
  testEnvironment: 'node',
};
