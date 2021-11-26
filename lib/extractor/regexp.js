/**
 * RegExp used to extract dependencies
 */

// extract dependency from `dependency/module`
const extractDependencyFromPartialRegExp = /^([^/]+)\//;

// extract dependency from `from 'dependency'` or `from "dependency"`
const extractImportRegExp = /from\s['|"]([^'"\n:.]+)['|"]/;

// extract dependency from `require('dependency')` or `require("dependency")`
const extractRequireRegExp = /require\(['|"]([^'".)]*)['|"]\)/;

// extract scoped dependency from `@scope/dependency/module`
const extractScopedDependencyRegExp = /^(@[^/]+\/[^/]+)/;

// exports
module.exports = Object.freeze({
  extractDependencyFromPartialRegExp,
  extractImportRegExp,
  extractRequireRegExp,
  extractScopedDependencyRegExp,
});
