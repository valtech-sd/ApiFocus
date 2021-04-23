'use strict';

/**
 * A class to hold the details of a Swagger Parse Error
 *
 * Note, the NodeJS util method is mapped here so it can
 * be used from inside the templates that will be used
 * to render the error.
 */
class GeneralError {
  constructor(err, swagger) {
    // The error
    this.err = err;
    // The swagger metadata object
    this.swagger = swagger;
    // NodeJS util method
    this.util = require('util');
  }
}

module.exports = GeneralError;
