class DependencyExtractionError extends Error {
  constructor(message, origin) {
    super(message);

    this.code = 'dependency-extraction-error';
    this.name = 'DependencyExtractionError';

    if (origin && origin.constructor.name && origin.constructor.name.includes('Error')) {
      this.stack = `${origin.stack}\n${this.stack}`;
    }
  }
}

module.exports = DependencyExtractionError;
