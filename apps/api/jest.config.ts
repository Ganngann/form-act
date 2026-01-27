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
      branches: 82.5,
      functions: 85.7,
      lines: 83.0,
      statements: 81.0,
    },
  },
  testEnvironment: 'node',
};
