'use strict';

const pug = require('pug');
const path = require('path');
const SwaggerParseError = require('../models/GeneralError');

/**
 * A class to output formatted errors when we have a Swagger parsing error
 * Examples: Path not found, bad parameters, etc.
 */
class GeneralErrorHelper {
  /**
   * Formats the error given the err and request objects.
   * @param err - an HttpError
   * @param req
   * @returns string
   */
  static formatError(err, req) {
    // Hydrate our error model
    const swaggerParseError = new SwaggerParseError(
      err,
      req.swagger
    );
    // Map the error template
    const swaggerParseErrorTemplatePath = path.join(
      __dirname,
      '/../templates/GeneralError.pug'
    );
    // Render the error with the model
    return pug.renderFile(swaggerParseErrorTemplatePath, swaggerParseError);
  }
}

module.exports = GeneralErrorHelper;
