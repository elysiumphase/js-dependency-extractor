#! /usr/bin/env node

const { Command } = require('commander');
const { bin, description, version } = require('../package.json');
const jsDependencyExtractor = require('../lib');

// run
const run = async function run() {
  const program = new Command();

  program.version(version, '-v, --version', 'output the current version')
    .description(description)
    .name(Object.keys(bin)[0])
    .showHelpAfterError('(add --help for additional information)')
    .showSuggestionAfterError()
    .option('-p, --path <path>', 'path to a file or a directory to extract dependencies from')
    .option('-d, --debug', 'output extra debugging', false)
    .option('-e, --only-extensions [onlyExtensions...]', 'specify file extensions to inspect')
    .option('-i, --ignore-paths [ignorePaths...]', 'specify path(s) to ignore')
    .option('-m, --merge-partial', 'whether to merge partial requires/imports into one main dependency', false);

  program.parse(process.argv);

  const {
    debug,
    ignorePaths,
    mergePartial,
    onlyExtensions,
    path,
  } = program.opts();

  if (debug) {
    console.debug('command options:', program.opts());
  }

  try {
    const dependencies = await jsDependencyExtractor({
      ignorePaths,
      mergePartial,
      onlyExtensions,
      path,
    });

    console.info(dependencies.join('\n'));
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};

run();
