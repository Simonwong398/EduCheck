module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/$1',
    '^@app/(.*)$': '<rootDir>/EduCheckApp/$1'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  testMatch: [
    "**/__tests__/**/*.test.js",
    "**/tests/**/*.test.js"
  ],
  moduleDirectories: ['node_modules', '<rootDir>', 'src'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10
    }
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-web)/)'
  ],
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
  rootDir: '.'
}
