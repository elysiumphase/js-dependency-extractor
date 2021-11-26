const { join: joinPath } = require('path');
const process = require('child_process');
const { expect } = require('./Common');
const package = require('../package.json');

const bin = joinPath(__dirname, '../bin');
const myProjectPath = joinPath(__dirname, './fixtures/my-project');

const jsde = function jsde(...args) {
  const stdout = process.execSync(`node ${bin} ${args.join(' ')}`);
  return stdout && stdout.toString('utf8');
};

const commands = [
  '-p',
  '--path',
  '-d',
  '--debug',
  '-e',
  '--only-extensions',
  '-i',
  '--ignore-paths',
  '-m',
  '--merge-partial',
  '-v',
  '--version',
];

const fullDependencies = `@airbnb/example-lib/partial
@airbnb/node-memwatch
chai
crypto
fs
gm
image-magic
path
sharp
submodule1
submodule2
util
uuid/v1
uuid/v4
`;

const mergePartialDependencies = `@airbnb/example-lib
@airbnb/node-memwatch
chai
crypto
fs
gm
image-magic
path
sharp
submodule1
submodule2
util
uuid
`;

// ignoring test, node_modules and .old
const ignoredPathsDependencies = `@airbnb/example-lib/partial
@airbnb/node-memwatch
crypto
fs
path
sharp
util
uuid/v1
uuid/v4
`;

// only .ts
const onlyTsExtensionDependencies = `@airbnb/example-lib/partial
@airbnb/node-memwatch
crypto
path
uuid/v1
uuid/v4
`;

describe('#cli', function() {
  context('when specifying no path', function() {
    it('should exit process with an error', function() {
      expect(() => {
        jsde();
      }).to.throw(Error).and.to.have.property('status').and.to.equal(1);
    });
  });

  context('when specifying an unknown path', function() {
    it('should exit process with an error', function() {
      expect(() => {
        jsde('-p', 'path/to/probably/nowhere');
      }).to.throw(Error).and.to.have.property('status').and.to.equal(1);

      expect(() => {
        jsde('--path', 'path/to/probably/nowhere');
      }).to.throw(Error).and.to.have.property('status').and.to.equal(1);
    });
  });

  context('when asking for help', function() {
    it('should output help with all commands listed', function() {
      const stdout = jsde('-h');
      expect(stdout).to.include(Object.keys(package.bin)[0])
        .and.to.include(package.description)
        .and.to.include('Options');

        commands.forEach((command) => {
          expect(stdout).to.include(command);
        });
    });
  });

  context('when specifying a path', function() {
    it('should output extra debugging if debug option is true', function() {
      const stdout = jsde('-p', myProjectPath, '-d');
      expect(stdout).to.include('command options').and.to.include('debug: true');
    });

    it('should print a full list of dependencies', function() {
      let stdout = jsde('-p', myProjectPath);
      expect(stdout).to.equal(fullDependencies);

      stdout = jsde('--path', myProjectPath);
      expect(stdout).to.equal(fullDependencies);
    });

    it('should print a list of dependencies with partial requires/imports merged into one single dependency', function() {
      let stdout = jsde('-p', myProjectPath, '-m');
      expect(stdout).to.equal(mergePartialDependencies);

      stdout = jsde('-p', myProjectPath, '--merge-partial');
      expect(stdout).to.equal(mergePartialDependencies);
    });

    it('should print a list of dependencies without the ones ignored in path', function() {
      let stdout = jsde('-p', myProjectPath, '-i', 'my-project/test node_modules .old');
      expect(stdout).to.equal(ignoredPathsDependencies);

      stdout = jsde('-p', myProjectPath, '--ignore-paths', 'my-project/test node_modules .old');
      expect(stdout).to.equal(ignoredPathsDependencies);
    });

    it('should print a list of dependencies only for some specified file extensions', function() {
      let stdout = jsde('-p', myProjectPath, '-e', '.ts');
      expect(stdout).to.equal(onlyTsExtensionDependencies);

      stdout = jsde('-p', myProjectPath, '--only-extensions', '.ts');
      expect(stdout).to.equal(onlyTsExtensionDependencies);
    });
  });
});
