/**
 * dependency extractor
 */
const { promises: { readdir, readFile, stat: getStats } } = require('fs');
const {
  join: joinPath,
  parse: parsePath,
  resolve: resolvePath,
} = require('path');
const debug = require('bugbug')('js-dependency-extractor', 'cyan');
const { DependencyExtractionError } = require('../errors');
const {
  extractDependencyFromPartialRegExp,
  extractImportRegExp,
  extractRequireRegExp,
  extractScopedDependencyRegExp,
} = require('./regexp');

/**
 * @func extractDependency
 * extract a dependency from its import or require content
 * @param  {String} content
 * @param  {String} format
 * @param  {Boolean} mergePartial
 * @return {String}
 */
const extractDependency = function extractDependency({ content, format, mergePartial } = {}) {
  if (!content || content.constructor !== String) {
    return null;
  }

  const extractRegExp = format === 'import' ? extractImportRegExp : extractRequireRegExp;
  const match = content.match(extractRegExp);
  const [, dependency] = match || [];

  if (!dependency) {
    return null;
  }

  if (mergePartial === true) {
    const matchDependency = dependency.match(extractScopedDependencyRegExp)
      || dependency.match(extractDependencyFromPartialRegExp);

    return matchDependency ? matchDependency[1] : dependency;
  }

  return dependency;
};

/**
 * @func extractDependencyNames
 * extract dependency names
 * @param  {Array} imports
 * @param  {Boolean} mergePartial
 * @param  {Array} requires
 * @return {Array} an alphabetically sorted list of dependencies
 */
const extractDependencyNames = function extractDependencyNames({
  imports,
  mergePartial,
  requires,
} = {}) {
  if (!Array.isArray(imports) && !Array.isArray(requires)) {
    return [];
  }
  const importDependencies = [];
  const requireDependencies = [];

  if (Array.isArray(imports)) {
    const importsUnique = [...new Set(imports)];

    importDependencies.push(...importsUnique
      .map((importDependency) => extractDependency({
        mergePartial,
        content: importDependency,
        format: 'import',
      }))
      .filter(Boolean));
  }

  if (Array.isArray(requires)) {
    const requiresUnique = [...new Set(requires)];

    requireDependencies.push(...requiresUnique
      .map((requireDependency) => extractDependency({
        mergePartial,
        content: requireDependency,
        format: 'require',
      }))
      .filter(Boolean));
  }

  return [...new Set([...importDependencies, ...requireDependencies])]
    .sort((a, b) => a.localeCompare(b));
};

/**
 * @func extractRequiresImportsFromFile
 * extract all requires and imports from a file
 * @param  {String} path
 * @return {Object} e.g. requires: ["require('dependency')"] imports: ["from 'dependency'"]
 */
const extractRequiresImportsFromFile = async function extractRequiresImportsFromFile({
  path,
} = {}) {
  const imports = [];
  const requires = [];

  try {
    const content = await readFile(resolvePath(path), 'utf8');
    const extractedImports = content.match(new RegExp(extractImportRegExp, 'g'));
    const extractedRequires = content.match(new RegExp(extractRequireRegExp, 'g'));

    if (Array.isArray(extractedImports)) {
      imports.push(...extractedImports);
      debug(`extracted imports for file ${path}`);
    }

    if (Array.isArray(extractedRequires)) {
      requires.push(...extractedRequires);
      debug(`extracted requires for file ${path}`);
    }
  } catch (e) {
    const error = new DependencyExtractionError(`error while extracting requires and imports for file ${path}, ${e.message}`, e);
    debug(error.message);
    throw error;
  }

  return {
    imports,
    requires,
  };
};

/**
 * @func extractRequiresImportsFromDirectory
 * recursively extract all requires from all files of a directory
 * @param  {Array} ignorePaths
 * @param  {Array} onlyExtensions
 * @param  {String} path
 * @return {Object}  e.g. requires: ["require('dependency')"] imports: ["from 'dependency'"]
 */
const extractRequiresImportsFromDirectory = async function extractRequiresImportsFromDirectory({
  ignorePaths,
  onlyExtensions,
  path,
} = {}) {
  const extracted = {
    imports: [],
    requires: [],
  };
  const ignore = Array.isArray(ignorePaths) ? ignorePaths : null;
  const extensions = Array.isArray(onlyExtensions) && onlyExtensions.length > 0
    ? onlyExtensions
    : null;

  try {
    const dirPath = resolvePath(path);
    const filenames = await readdir(dirPath);

    if (Array.isArray(filenames)) {
      await Promise.all(filenames.map(async (filename) => {
        const filePath = joinPath(dirPath, filename);

        // ignoring path(s)
        if (ignore) {
          const len = ignore.length;
          let isIgnored = false;

          for (let i = 0; i < len; i += 1) {
            if (filePath.includes(ignore[i])) {
              isIgnored = true;
              break;
            }
          }

          // break loop
          if (isIgnored) {
            return null;
          }
        }

        const fileStats = await getStats(filePath);
        const { ext } = parsePath(filePath);

        if (fileStats.isFile()) {
          if (!extensions || extensions.includes(ext)) {
            try {
              const extraction = await extractRequiresImportsFromFile({ path: filePath });
              extracted.imports.push(...extraction.imports);
              extracted.requires.push(...extraction.requires);
            } catch (e) {
              // don't throw
              debug(`error while extracting requires and imports for file ${filePath}, ${e.message}`);
            }
          }
        } else if (fileStats.isDirectory()) {
          const extraction = await extractRequiresImportsFromDirectory({
            ignorePaths,
            onlyExtensions,
            path: filePath,
          });
          extracted.imports.push(...extraction.imports);
          extracted.requires.push(...extraction.requires);
        }

        return filename;
      }));

      debug(`extracted requires and imports for directory ${path}`);
    }
  } catch (e) {
    const error = new DependencyExtractionError(`error while extracting requires and imports for directory ${path}, ${e.message}`, e);
    debug(error.message);
    throw error;
  }

  return extracted;
};

// exports
module.exports = Object.freeze({
  extractDependency,
  extractDependencyNames,
  extractRequiresImportsFromDirectory,
  extractRequiresImportsFromFile,
});
