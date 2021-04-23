'use strict';

/**
 * A class to hold the details of a path that does
 * not yet have a controller implementation.
 *
 * Note, the NodeJS util method is mapped here so it can
 * be used from inside the templates that will be used
 * to render the error.
 */
class NotImplementedError {
  constructor(err, swagger) {
    // The error
    this.err = err;
    // The swagger metadata object
    this.swagger = swagger;
    // NodeJS util method
    this.util = require('util');
  }
}

module.exports = NotImplementedError;
