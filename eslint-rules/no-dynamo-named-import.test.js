/**
 * Test for the no-dynamo-named-import ESLint rule
 */

// eslint-disable-next-line import/no-internal-modules
import {noDynamoNamedImport} from '../eslint-rules/no-dynamo-named-import.js'
import {RuleTester} from 'eslint'

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
})

ruleTester.run('no-dynamo-named-import', noDynamoNamedImport, {
  valid: [
    // Wildcard import is allowed
    {
      code: "import * as DynamoDB from 'aws-sdk/clients/dynamodb'",
    },
    // Imports from other modules are allowed
    {
      code: "import * as moment from 'moment'",
    },
    {
      code: "import { Config } from 'aws-sdk'",
    },
  ],

  invalid: [
    // Named imports from aws-sdk/clients/dynamodb are not allowed
    {
      code: "import { Key } from 'aws-sdk/clients/dynamodb'",
      errors: [
        {
          messageId: 'namedImportNotAllowed',
        },
      ],
    },
    // Multiple named imports also not allowed
    {
      code: "import { Key, AttributeMap } from 'aws-sdk/clients/dynamodb'",
      errors: [
        {
          messageId: 'namedImportNotAllowed',
        },
      ],
    },
  ],
})

// eslint-disable-next-line no-undef
console.log('All tests passed!')

