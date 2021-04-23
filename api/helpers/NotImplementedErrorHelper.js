'use strict';

const pug = require('pug');
const NotImplementedError = require('../models/NotImplementedError');

/**
 * A class to output formatted errors when we have a path
 * has no implementation that caught it (no Express route implementation).
 */
class NotImplementedErrorHelper {
  /**
   * Formats the error given the err and request objects.
   * @param err
   * @param req
   * @returns string
   */
  static formatError(err, req) {
    // Hydrate our error model
    const notImplementedError = new NotImplementedError(err, req.swagger);
    // Map the error template
    const notImplementedErrorTemplatePath = `${__dirname}/../templates/NotImplementedError.pug`;
    // Render the error with the model
    return pug.renderFile(notImplementedErrorTemplatePath, notImplementedError);
  }
}

module.exports = NotImplementedErrorHelper;
