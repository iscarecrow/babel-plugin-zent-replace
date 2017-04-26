var t = require('babel-types');
var chalk = require('chalk');

var moduleName = 'zent';

// 此处可以改成通用配置
function replaceRules(name) {
  return moduleName +'/' + name.toLowerCase();
};

// import below is not allowed
function log (value) {
    throw new Error(
    chalk.yellow(
      "\n" +
      "====================================" + "\n" +
      "import * as Zent from 'zent'"   + "\n" +
      "import XX from 'zent-xx'" + "\n" +
      "const zent = require('zent')" + "\n" +
      "以上三种import方式废弃，请使用 import { XX } from 'zent'" + "\n" +
      "=========================================" + "\n" )
    );
}

module.exports = function() {
  return {
    visitor: {
      CallExpression(path, state) {
        var node = path.node;
        var args = node.arguments || [];
        if (node.callee.name === "require" && args.length === 1 && t.isStringLiteral(args[0])) {
          if (args[0].value === moduleName) {
            log();
          }
        }
      },
      ImportDeclaration(path, state) {
        var source = path.node.source;

        var fullImports =  path.node.specifiers.filter(function(specifier) { return specifier.type !== 'ImportSpecifier' });

        var importSpecifiers = path.node.specifiers.filter(function(specifier) { return specifier.type === 'ImportSpecifier' });

        if (fullImports.length > 0) {
          var reg = /(zent$|zent-)/ig;
          if (reg.test(source.value)) {
            log();
          }
        }
        var newImportDeclarations = [];

        if (importSpecifiers.length > 0) {
          importSpecifiers.forEach(function(importSpecifier) {
            var importedName = importSpecifier.imported.name;
            if (source.value === moduleName) {
              var newImportedName = replaceRules(importedName);
              var newImportDeclaration = t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier(importedName))],
                t.stringLiteral(newImportedName)
              );
             
              newImportDeclarations.push(newImportDeclaration);
            }
          })
        }

        if (newImportDeclarations.length > 0) {
          path.replaceWithMultiple(newImportDeclarations);
        }
      }
    }
  }
}