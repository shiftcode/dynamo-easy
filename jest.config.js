/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.jest.json'
      },
    ],
  },
  setupFiles: [
    "reflect-metadata",
    './test/jest-setup.ts'
  ]
};
