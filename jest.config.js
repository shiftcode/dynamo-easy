/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
     '^.+\\.tsx?$': [
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
