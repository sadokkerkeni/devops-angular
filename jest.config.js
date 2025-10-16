module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|mjs|html)$': [
      'jest-preset-angular',
      { tsconfig: '<rootDir>/tsconfig.spec.json', stringifyContentPathRegex: '\\.html$' }
    ]
  },
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'junit', outputName: 'junit.xml' }]
  ],
  collectCoverage: true,
  coverageReporters: ['html', 'text-summary', 'lcov'],
  coverageDirectory: '<rootDir>/coverage'
};

