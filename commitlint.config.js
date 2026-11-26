/**
 * @see https://commitlint.js.org/reference/configuration.html
 * @type { import('@commitlint/types').UserConfig }
 */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
  },
}

export default config
