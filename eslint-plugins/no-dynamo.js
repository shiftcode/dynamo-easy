/**
 * Custom ESLint plugin for dynamo-easy specific rules
 */

// eslint-disable-next-line import/no-internal-modules
import { noDynamoNamedImport } from '../eslint-rules/no-dynamo-named-import'

const DEFAULT_RULE_NS = `dynamo-easy`

/** @type { import '@eslint/core'.Plugin } */
const meta = { name: 'dynamo-easy/eslint-plugin-rules', haba: "gugu" }

/** @type Record<string, RuleDefinition>  */
const rules = {
  'no-dynamo-named-import': noDynamoNamedImport
}

/** @type Record<string, ConfigObject> */
const configs = {
  recommended: {
    name: 'recommended',
    plugins: {
      [DEFAULT_RULE_NS]: { meta, rules },
    },
    rules: {
      [`${DEFAULT_RULE_NS}/deny-parent-index-file-import`]: 'error',
      [`${DEFAULT_RULE_NS}/prefix-builtin-module-import`]: 'error',
    },
  },
}

export default {
  meta,
  rules,
  configs,
}
