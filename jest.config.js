module.exports = {
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      tsConfigFile: "./tsconfig.jest.json"
    }
  },
  transform: {
    ".(ts|tsx|js)": "ts-jest"
  },
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/test/"
  ],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10
    }
  },
  setupFiles: [
    "reflect-metadata",
    './test/jest-setup.ts'
  ]
};
