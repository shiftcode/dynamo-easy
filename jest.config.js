module.exports = {
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
  globals: {
    "ts-jest": {
      diagnostics: {
        ignoreCodes: [151001]
      },
      tsConfig: "./tsconfig.jest.json"
    }
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],
  setupFiles: [
    "reflect-metadata",
    './test/jest-setup.ts'
  ],
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  transform: {
    ".(ts|tsx|js)": "ts-jest"
  }
}
