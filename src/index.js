/**
 * js-dependency-extractor
 *
 * A JavaScript and TypeScript files dependency extractor
 */
const { promises: { stat: getStats } } = require('fs');
const { resolve: resolvePath } = require('path');
const debug = require('bugbug')('js-dependency-extractor', 'cyan');
const { DependencyExtractionError } = require('./errors');
const {
  extractDependencyNames,
  extractRequiresImportsFromDirectory,
  extractRequiresImportsFromFile,
} = require('./extractor');

/**
 * @func jsDependencyExtractor
 * extract dependencies from a directory or a file, main entry point
 * @param  {Array} ignorePaths
 * @param  {Boolean} mergePartial whether to merge partial requires/imports
 *                   like require('dependency/module')
 * @param  {Array} onlyExtensions
 * @param  {String} path
 * @return {Array}
 */
const jsDependencyExtractor = async function jsDependencyExtractor({
  ignorePaths,
  mergePartial,
  onlyExtensions,
  path,
} = {}) {
  const dependencies = [];
  debug(`⏳ extracting deps at path ${path || '(not defined)'}, ignoring paths: ${ignorePaths || 'not specified'}, extensions: ${onlyExtensions || 'not specified'}, merge partial requires/imports: ${mergePartial === true}`);

  try {
    const filePath = resolvePath(path);
    const fileStats = await getStats(filePath);
    let extracted;

    if (fileStats.isFile()) {
      extracted = await extractRequiresImportsFromFile({ path: filePath });
    } else if (fileStats.isDirectory()) {
      extracted = await extractRequiresImportsFromDirectory({
        ignorePaths,
        onlyExtensions,
        path: filePath,
      });
    } else {
      throw new Error(`valid path to a file or a directory expected, found ${path}`);
    }

    if (extracted.imports.length > 0 || extracted.requires.length > 0) {
      dependencies.push(...extractDependencyNames({
        mergePartial,
        imports: extracted.imports,
        requires: extracted.requires,
      }));
    }

    debug(`💚  extracted deps at path ${path}, ignoring paths: ${ignorePaths || 'not specified'}, extensions: ${onlyExtensions || 'not specified'}, merge partial requires/imports: ${mergePartial === true}`);
  } catch (e) {
    const error = new DependencyExtractionError(`unable to extract dependencies at ${path}, ${e.message}`, e);
    debug(`⛑  ${error.message}`);
    throw error;
  }

  return dependencies;
};

// exports
module.exports = jsDependencyExtractor;
