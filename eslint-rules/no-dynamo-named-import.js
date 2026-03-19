/**
 * Custom ESLint rule: no-dynamo-named-import
 *
 * We prevent named imports from aws-sdk/clients/dynamodb, this is a design decision to be more obvious about where the
 * import is from, this is not common practice but because our code has a lot of code dependent on dynamoDB we do this
 * for easier reading and understanding
 */

import { ESLintUtils } from '@typescript-eslint/utils'

export const noDynamoNamedImport = ESLintUtils.RuleCreator.withoutDocs(() => {
  return {
    create(context) {
      return {
        ImportDeclaration(node) {
          const moduleName = node.source.value

          if (moduleName === 'aws-sdk/clients/dynamodb') {
            // Check if it's a named import
            if (node.specifiers && node.specifiers.length > 0) {
              const hasNamedImport = node.specifiers.some(
                (specifier) => specifier.type === 'ImportSpecifier'
              )

              if (hasNamedImport) {
                context.report({
                  node,
                  messageId: 'namedImportNotAllowed',
                })
              }
            }
          }
        },
      }
    },
  }
})
