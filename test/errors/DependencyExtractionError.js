const { expect } = require('../Common');
const DependencyExtractionError = require('../../src/errors/DependencyExtractionError');

describe('#errors', function() {
  context('when using DependencyExtractionError', function() {
    it('should be a native error with specific code and name', function() {
      const error = new DependencyExtractionError('message');

      expect(DependencyExtractionError).to.be.a('function');
      expect(error).to.be.an('error').with.property('code', 'dependency-extraction-error');
      expect(error).to.be.an('error').with.property('name', 'DependencyExtractionError');
    });
  });
});
