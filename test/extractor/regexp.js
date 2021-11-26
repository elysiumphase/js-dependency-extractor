const { expect } = require('../Common');
const {
  extractDependencyFromPartialRegExp,
  extractImportRegExp,
  extractRequireRegExp,
  extractScopedDependencyRegExp,
} = require('../../lib/extractor/regexp');

describe('#extractor regexp', function() {
  context('when using extractDependencyFromPartialRegExp', function() {
    it('should extract dependency from `dependency/module`', function() {
      let match = 'dependency/module'.match(extractDependencyFromPartialRegExp);
      expect(match).to.be.an('array');
      expect(match[1]).to.equal('dependency');

      match = 'dependency/module/module'.match(extractDependencyFromPartialRegExp);
      expect(match).to.be.an('array');
      expect(match[1]).to.equal('dependency');
    });
  });

  context('when using extractImportRegExp', function() {
    it('should extract dependency from regular import `from \'dependency\'`', function() {
      let match = 'from \'dependency\''.match(extractImportRegExp);
      expect(match).to.be.an('array');
      expect(match[1]).to.equal('dependency');

      match = 'from "dependency"'.match(extractImportRegExp);
      expect(match).to.be.an('array');
      expect(match[1]).to.equal('dependency');

      match = 'from \'dependency/module\''.match(extractImportRegExp);
      expect(match).to.be.an('array');
      expect(match[1]).to.equal('dependency/module');
    });

    it('should not extract dependency from non regular import', function() {
      let match = 'from\'dependency\''.match(extractImportRegExp);
      expect(match).to.be.null;

      match = 'from  "dependency"'.match(extractImportRegExp);
      expect(match).to.be.null;

      match = 'from \'depen: \'dency"/module\''.match(extractImportRegExp);
      expect(match).to.be.null;

      match = 'from \'depen:"dency\''.match(extractImportRegExp);
      expect(match).to.be.null;

      match = 'from \'de\npend.ency\''.match(extractImportRegExp);
      expect(match).to.be.null;
    });
  });

  context('when using extractRequireRegExp', function() {
    it('should extract dependency from regular require `require(\'dependency\')`', function() {
      let match = 'require(\'dependency\')'.match(extractRequireRegExp);
      expect(match).to.be.an('array');
      expect(match[1]).to.equal('dependency');

      match = 'require("dependency")'.match(extractRequireRegExp);
      expect(match).to.be.an('array');
      expect(match[1]).to.equal('dependency');

      match = 'require(\'dependency/module\')'.match(extractRequireRegExp);
      expect(match).to.be.an('array');
      expect(match[1]).to.equal('dependency/module');
    });

    it('should not extract dependency from non regular require', function() {
      let match = 'require(\'dep)endency\')'.match(extractRequireRegExp);
      expect(match).to.be.null;

      match = 'require(\'depen.\'dency\')'.match(extractRequireRegExp);
      expect(match).to.be.null;

      match = 'require(\'depen"dency\')'.match(extractRequireRegExp);
      expect(match).to.be.null;

      match = 'require(\'depen.dency\')'.match(extractRequireRegExp);
      expect(match).to.be.null;

      match = 'require   (\'dependency\')'.match(extractRequireRegExp);
      expect(match).to.be.null;
    });
  });

  context('when using extractScopedDependencyRegExp', function() {
    it('should extract dependency from scoped dependency `require(\'@scope/dependency\')`', function() {
      let match = '@scope/dependency'.match(extractScopedDependencyRegExp);
      expect(match).to.be.an('array');
      expect(match[1]).to.equal('@scope/dependency');

      match = '@scope/dependency/module'.match(extractScopedDependencyRegExp);
      expect(match).to.be.an('array');
      expect(match[1]).to.equal('@scope/dependency');

      match = '@scope/dependency/module/module'.match(extractScopedDependencyRegExp);
      expect(match).to.be.an('array');
      expect(match[1]).to.equal('@scope/dependency');
    });

    it('should not extract scoped dependency from non regular form', function() {
      let match = '@scope\\dependency'.match(extractRequireRegExp);
      expect(match).to.be.null;

      match = '@scope / dependency'.match(extractRequireRegExp);
      expect(match).to.be.null;
    });
  });
});
