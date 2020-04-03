'use strict'

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'DynamoDB needs to be imported with wildcard (import * as DynamoDB from \'aws-sdk/clients/dynamodb\')',
    },
    schema: [], // no options
    messages: {
      unexpected: 'only wildcard import (import * as DynamoDB from \'aws-sdk/clients/dynamodb\') is allowed',
    },
  },
  create: function (context) {
    return {
      ImportDeclaration(node) {
        const { source, specifiers } = node
        if (source && source.value === 'aws-sdk/clients/dynamodb') {
          // necessary to check the specifiers
          if (Array.isArray(specifiers) && specifiers.some(sp => sp.type === 'ImportSpecifier')) {
            // fail, only allowed type is ImportNamespaceSpecifier
            context.report({ node, messageId: 'unexpected' })
          }
        }
      },
    }
  },
}
