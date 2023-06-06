const { join: joinPath } = require('path');
const { expect } = require('./Common');
const lib = require('../src');

const fullDependencies = [
  '@airbnb/example-lib/partial',
  '@airbnb/node-memwatch',
  'chai',
  'crypto',
  'fs',
  'gm',
  'image-magic',
  'path',
  'sharp',
  'submodule1',
  'submodule2',
  'util',
  'uuid/v1',
  'uuid/v4'
];

const mergePartialDependencies = [
  '@airbnb/example-lib',
  '@airbnb/node-memwatch',
  'chai',
  'crypto',
  'fs',
  'gm',
  'image-magic',
  'path',
  'sharp',
  'submodule1',
  'submodule2',
  'util',
  'uuid'
];

// ignoring test, node_modules and .old
const ignoredPathsDependencies = [
  '@airbnb/example-lib/partial',
  '@airbnb/node-memwatch',
  'crypto',
  'fs',
  'path',
  'sharp',
  'util',
  'uuid/v1',
  'uuid/v4'
];

// only .ts
const onlyTsExtensionDependencies = [
  '@airbnb/example-lib/partial',
  '@airbnb/node-memwatch',
  'crypto',
  'path',
  'uuid/v1',
  'uuid/v4'
];

describe('#lib', function() {
  context('when requiring lib', function() {
    it('should return the expected function', function() {
      expect(lib).to.be.a('function');
      expect(lib.name).to.equal('jsDependencyExtractor');
    });
  });

  context('when using lib', function() {
    context('when specifying no path', function() {
      it('should throw an error', async function() {
        let dependencies;
        let error;

        try {
          dependencies = await lib({
            path: null,
          });
        } catch (e) {
          error = e;
        }

        expect(error).to.be.an('error').with.property('code', 'dependency-extraction-error');
        expect(error).to.be.an('error').with.property('name', 'DependencyExtractionError');
        expect(dependencies).to.be.undefined;
      });
    });

    context('when specifying a file', function() {
      it('should return an empty array if there is no dependency', async function() {
        let dependencies;
        let error;

        try {
          dependencies = await lib({
            path: joinPath(__dirname, './fixtures/my-project/app/empty/index.js'),
          });
        } catch (e) {
          error = e;
        }

        expect(error).to.be.undefined;
        expect(dependencies).to.be.an('array').and.to.eql([]);
      });

      it('should return all dependencies listed in this file alphabetically ordered', async function() {
        let dependencies;
        let error;

        try {
          dependencies = await lib({
            path: joinPath(__dirname, './fixtures/my-project/app/index.ts'),
          });
        } catch (e) {
          error = e;
        }

        expect(error).to.be.undefined;
        expect(dependencies).to.be.an('array').and.to.eql(onlyTsExtensionDependencies);
        expect([...dependencies]).to.eql(dependencies.sort((a, b) => a.localeCompare(b)));
      });
    });

    context('when specifying a directory with no other option', function() {
      it('should return an empty array if there is no dependency', async function() {
        let dependencies;
        let error;

        try {
          dependencies = await lib({
            path: joinPath(__dirname, './fixtures/my-project/app/empty'),
          });
        } catch (e) {
          error = e;
        }

        expect(error).to.be.undefined;
        expect(dependencies).to.be.an('array').and.to.eql([]);
      });

      it('should return all dependencies listed in the project alphabetically ordered', async function() {
        let dependencies;
        let error;

        try {
          dependencies = await lib({
            path: joinPath(__dirname, './fixtures/my-project'),
          });
        } catch (e) {
          error = e;
        }

        expect(error).to.be.undefined;
        expect(dependencies).to.be.an('array').and.to.eql(fullDependencies);
        expect([...dependencies]).to.eql(dependencies.sort((a, b) => a.localeCompare(b)));
      });
    });

    context('when specifying a directory with other options at null/undefined or empty', function() {
      it('should return all dependencies listed in the project', async function() {
        let dependencies;
        let error;

        try {
          dependencies = await lib({
            ignorePaths: null,
            mergePartial: undefined,
            onlyExtensions: undefined,
            path: joinPath(__dirname, './fixtures/my-project'),
          });
        } catch (e) {
          error = e;
        }

        expect(error).to.be.undefined;
        expect(dependencies).to.be.an('array').and.to.eql(fullDependencies);
      });
    });

    context('when specifying a directory with other options empty', function() {
      it('should return all dependencies listed in the project', async function() {
        let dependencies;
        let error;

        try {
          dependencies = await lib({
            ignorePaths: [],
            onlyExtensions: [],
            path: joinPath(__dirname, './fixtures/my-project'),
          });
        } catch (e) {
          error = e;
        }

        expect(error).to.be.undefined;
        expect(dependencies).to.be.an('array').and.to.eql(fullDependencies);
      });
    });

    context('when specifying a directory with mergePartial at true', function() {
      it('should return all dependencies listed in the project with partial requires/imports merged into a single dependency', async function() {
        let dependencies;
        let error;

        try {
          dependencies = await lib({
            ignorePaths: null,
            mergePartial: true,
            onlyExtensions: undefined,
            path: joinPath(__dirname, './fixtures/my-project'),
          });
        } catch (e) {
          error = e;
        }

        expect(error).to.be.undefined;
        expect(dependencies).to.be.an('array').and.to.eql(mergePartialDependencies);
      });
    });

    context('when specifying a directory and ignored path(s)', function() {
      it('should return all dependencies listed in the project without the ones listed in ignored path(s)', async function() {
        let dependencies;
        let error;

        try {
          dependencies = await lib({
            ignorePaths: ['my-project/test', 'node_modules', '.old'],
            mergePartial: false,
            onlyExtensions: undefined,
            path: joinPath(__dirname, './fixtures/my-project'),
          });
        } catch (e) {
          error = e;
        }

        expect(error).to.be.undefined;
        expect(dependencies).to.be.an('array').and.to.eql(ignoredPathsDependencies);
      });
    });

    context('when specifying a directory and specific file extensions', function() {
      it('should return all dependencies listed in the project only for specified file extensions', async function() {
        let dependencies;
        let error;

        try {
          dependencies = await lib({
            ignorePaths: [],
            mergePartial: false,
            onlyExtensions: ['.ts'],
            path: joinPath(__dirname, './fixtures/my-project'),
          });
        } catch (e) {
          error = e;
        }

        expect(error).to.be.undefined;
        expect(dependencies).to.be.an('array').and.to.eql(onlyTsExtensionDependencies);
      });
    });
  });
});
