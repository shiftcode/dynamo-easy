const { RuleTester } = require('eslint')
const typeCheckRule = require('./no-named-dynamo-import')

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015, sourceType: 'module' } })
const errors = [{ messageId: 'unexpected' }]


ruleTester.run('type-check', typeCheckRule, {
  valid: [
    'import * as DynamoDB from "aws-sdk/clients/dynamodb"', // normal
    'import * as Dynamo2 from \'aws-sdk/clients/dynamodb\'', // alt name is allowed
    'import DynamoDB from \'aws-sdk/clients/dynamodb\'', // default is allowed
    'import { Config } from \'aws-sdk\'', // other stuff is allowed
    'import * as moment from \'moment\'',
  ],
  invalid: [
    {
      code: 'import { StringAttributeValue } from "aws-sdk/clients/dynamodb"',
      errors,
    },
    // {
    //   code: 'import { StringAttributeValue }, * as DynamoDB from "aws-sdk/clients/dynamodb"',
    //   errors,
    // },
  ],
})
