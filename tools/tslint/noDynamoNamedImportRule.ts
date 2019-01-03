import * as ts from 'typescript'
import * as Lint from 'tslint'
import { isNamedImports } from 'tsutils'

/**
 * We prevent named imports from aws-sdk/clients/dynamodb, this is a design decision to be more obvious about where the
 * import is from, this is not common practice but because our code has a lot of code dependent on dynamodb we do this
 * for easier reading and understanding
 */
class NoDynamoDbWildcardImportWalker extends Lint.RuleWalker {

  visitImportDeclaration(node: ts.ImportDeclaration) {
    const moduleName = node.moduleSpecifier.getText(this.getSourceFile())
    // remove outer quotes string looks like "'moduleName'"
      .replace(/"|'/g, '')
    if (moduleName === 'aws-sdk/clients/dynamodb' && isNamedImports(node.importClause.namedBindings)) {
      this.addFailureAtNode(node, Rule.FAILURE_STRING)
    }

    // call the base version of this visitor to actually parse this node
    super.visitImportDeclaration(node)
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  static FAILURE_STRING = 'only wildcard import (import * as DynamoDB from \'aws-sdk/clients/dynamodb\') is allowed for this module'

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new NoDynamoDbWildcardImportWalker(sourceFile, this.getOptions()))
  }
}
