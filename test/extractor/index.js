const { join: joinPath } = require('path');
const { expect } = require('../Common');
const {
  extractDependency,
  extractDependencyNames,
  extractRequiresImportsFromDirectory,
  extractRequiresImportsFromFile,
} = require('../../lib/extractor');

// in all fixtures my-project directory
const myProjectRequiresImports = {
  imports: [
    'from \'path\'',
    'from \'@airbnb/node-memwatch\'',
    'from \'@airbnb/example-lib/partial\'',
    'from \'uuid/v1\'',
    'from \'uuid/v4\'',
  ],
  requires: [
    'require(\'gm\')',
    'require(\'image-magic\')',
    'require(\'sharp\')',
    'require(\'crypto\')',
    'require(\'fs\')',
    'require(\'util\')',
    'require(\'sharp\')',
    'require(\'chai\')',
    'require(\'submodule1\')',
    'require(\'submodule2\')',
  ],
};

// index.ts and helpers.js
const appRequiresImports = {
  imports: [
    'from \'path\'',
    'from \'@airbnb/node-memwatch\'',
    'from \'@airbnb/example-lib/partial\'',
    'from \'uuid/v1\'',
    'from \'uuid/v4\'',
  ],
  requires: [
    'require(\'fs\')',
    'require(\'util\')',
    'require(\'sharp\')',
    'require(\'crypto\')',
  ],
};

// only .ts
const onlyTsRequiresImports = {
  imports: ['from \'path\'', 'from \'@airbnb/node-memwatch\'', 'from \'@airbnb/example-lib/partial\'', 'from \'uuid/v1\'', 'from \'uuid/v4\''],
  requires: ['require(\'crypto\')'],
};

describe('#extractor', function() {
  context('when using extractDependency', function() {
    it('should return null if the content to extract is not a string', function() {
      expect(extractDependency({ content: null, format: null, mergePartial: null })).to.be.null;
    });

    it('should return the dependency contained in a require or import', function() {
      expect(extractDependency({ content: 'require(\'dependency\')', format: 'require', mergePartial: null })).to.equal('dependency');
      expect(extractDependency({ content: 'from \'dependency\'', format: 'import', mergePartial: null })).to.equal('dependency');
      expect(extractDependency({ content: 'from \'dependency/partial\'', format: 'import', mergePartial: null })).to.equal('dependency/partial');
    });

    it('should return the dependency contained in a partial require or import if mergePartial is true', function() {
      expect(extractDependency({ content: 'require(\'dependency/partial\')', format: 'require', mergePartial: true })).to.equal('dependency');
      expect(extractDependency({ content: 'from \'dependency/partial\'', format: 'import', mergePartial: true })).to.equal('dependency');
    });
  });

  context('when using extractDependencyNames', function() {
    it('should return an empty array if both requires and imports are not an array', function() {
      expect(extractDependencyNames({
        imports: null,
        mergePartial: null,
        requires: null,
      })).to.eql([]);
    });

    it('should return an empty array if both requires and imports are empty arrays', function() {
      expect(extractDependencyNames({
        imports: [],
        mergePartial: null,
        requires: [],
      })).to.eql([]);
    });

    it('should return dependency names from imports and/or requires without redundancy', function() {
      expect(extractDependencyNames({
        imports: ['from \'dependency1\'', 'from \'dependency2/partial\'', 'from \'dependency3\'', 'from \'dependency4\''],
        mergePartial: null,
        requires: ['require(\'dependency1/partial\')', 'require(\'dependency4\')'],
      })).to.eql(['dependency1', 'dependency1/partial', 'dependency2/partial', 'dependency3', 'dependency4']);
    });

    it('should return dependency names from imports and/or requires without redundancy neither partials if mergePartial is true', function() {
      expect(extractDependencyNames({
        imports: ['from \'dependency1\'', 'from \'dependency2/partial\'', 'from \'dependency3\'', 'from \'dependency4\''],
        mergePartial: true,
        requires: ['require(\'dependency1/partial\')', 'require(\'dependency4\')'],
      })).to.eql(['dependency1', 'dependency2', 'dependency3', 'dependency4']);
    });
  });

  context('when using extractRequiresImportsFromFile', function() {
    it('should throw an extraction error if the path is null or undefined', async function() {
      let extracted;
      let error;

      try {
        extracted = await extractRequiresImportsFromFile({ path: null });
      } catch (e) {
        error = e;
      }

      expect(extracted).to.be.undefined;
      expect(error).to.be.an('error').with.property('code', 'dependency-extraction-error');
      expect(error).to.be.an('error').with.property('name', 'DependencyExtractionError');
    });

    it('should throw an extraction error if the file does not exist', async function() {
      let extracted;
      let error;

      try {
        extracted = await extractRequiresImportsFromFile({ path: 'path/to/probably/nowhere.js' });
      } catch (e) {
        error = e;
      }

      expect(extracted).to.be.undefined;
      expect(error).to.be.an('error').with.property('code', 'dependency-extraction-error');
      expect(error).to.be.an('error').with.property('name', 'DependencyExtractionError');
    });

    it('should return requires and imports listed in a file', async function() {
      let extracted;
      let error;

      try {
        extracted = await extractRequiresImportsFromFile({ path: joinPath(__dirname, '../fixtures/my-project/app/index.ts') });
      } catch (e) {
        error = e;
      }

      expect(error).to.be.undefined;
      expect(extracted).to.eql(onlyTsRequiresImports);
    });
  });

  context('when using extractRequiresImportsFromDirectory', function() {
    it('should throw an extraction error if the path is null or undefined', async function() {
      let extracted;
      let error;

      try {
        extracted = await extractRequiresImportsFromDirectory({
          ignorePaths: null,
          onlyExtensions: null,
          path: null,
        });
      } catch (e) {
        error = e;
      }

      expect(extracted).to.be.undefined;
      expect(error).to.be.an('error').with.property('code', 'dependency-extraction-error');
      expect(error).to.be.an('error').with.property('name', 'DependencyExtractionError');
    });

    it('should throw an extraction error if the directory does not exist', async function() {
      let extracted;
      let error;

      try {
        extracted = await extractRequiresImportsFromDirectory({
          ignorePaths: null,
          onlyExtensions: null,
          path: 'path/to/probably/nowhere',
        });
      } catch (e) {
        error = e;
      }

      expect(extracted).to.be.undefined;
      expect(error).to.be.an('error').with.property('code', 'dependency-extraction-error');
      expect(error).to.be.an('error').with.property('name', 'DependencyExtractionError');
    });

    it('should return requires and imports from files present in a directory recursively', async function() {
      let extracted;
      let error;

      try {
        extracted = await extractRequiresImportsFromDirectory({
          ignorePaths: null,
          onlyExtensions: null,
          path: joinPath(__dirname, '../fixtures/my-project/'),
        });
      } catch (e) {
        error = e;
      }

      expect(error).to.be.undefined;
      expect(extracted).to.be.an('object');
      expect(extracted.imports).to.include.members(myProjectRequiresImports.imports);
      expect(extracted.requires).to.include.members(myProjectRequiresImports.requires);
    });

    it('should return requires and imports from files present in a directory recursively without the ones ignored in path if specified', async function() {
      let extracted;
      let error;

      try {
        extracted = await extractRequiresImportsFromDirectory({
          ignorePaths: ['my-project/test', 'node_modules', '.old'],
          onlyExtensions: null,
          path: joinPath(__dirname, '../fixtures/my-project/'),
        });
      } catch (e) {
        error = e;
      }

      expect(error).to.be.undefined;
      expect(extracted).to.be.an('object');
      expect(extracted.imports).to.include.members(appRequiresImports.imports);
      expect(extracted.requires).to.include.members(appRequiresImports.requires);
    });

    it('should return requires and imports from files with a specific extension only in a directory recursively if specified', async function() {
      let extracted;
      let error;

      try {
        extracted = await extractRequiresImportsFromDirectory({
          ignorePaths: [],
          onlyExtensions: ['.ts'],
          path: joinPath(__dirname, '../fixtures/my-project/'),
        });
      } catch (e) {
        error = e;
      }

      expect(error).to.be.undefined;
      expect(extracted).to.be.an('object');
      expect(extracted).to.eql(onlyTsRequiresImports);
    });
  });
});
