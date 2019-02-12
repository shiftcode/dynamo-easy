"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var tsutils_1 = require("tsutils");
var Lint = require("tslint");
// The walker takes care of all the work.
var NoDynamoDbWildcardImportWalker = /** @class */ (function (_super) {
    __extends(NoDynamoDbWildcardImportWalker, _super);
    function NoDynamoDbWildcardImportWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoDynamoDbWildcardImportWalker.prototype.visitImportDeclaration = function (node) {
        var moduleName = node.moduleSpecifier.getText(this.getSourceFile())
            // remove outer quotes string looks like "'moduleName'"
            .replace(/"|'/g, '');
        if (moduleName === 'aws-sdk/clients/dynamodb' && tsutils_1.isNamedImports(node.importClause.namedBindings)) {
            this.addFailureAtNode(node, Rule.FAILURE_STRING);
        }
        // call the base version of this visitor to actually parse this node
        _super.prototype.visitImportDeclaration.call(this, node);
    };
    return NoDynamoDbWildcardImportWalker;
}(Lint.RuleWalker));
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new NoDynamoDbWildcardImportWalker(sourceFile, this.getOptions()));
    };
    Rule.FAILURE_STRING = 'only wildcard import (import * as DynamoDB from \'aws-sdk/clients/dynamodb\') is allowed for this module';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
