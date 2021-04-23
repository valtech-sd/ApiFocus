'use strict';

const HttpError = require('http-errors');

/**
 * Swagger 2 Authentication is described here: https://swagger.io/docs/specification/2-0/authentication/
 *
 * The specification is complex and multiple schemes are supported by the spec.
 *
 * However, in this example we assume (and use) only the first authentication scheme we find
 * in a request. We then look that up in the API definition to figure out
 * the kind of authentication that it represents from the Swagger supported types.
 *
 * In this example, we're using a simple apikey header! (Note that headers are lowercased in all requests,
 * whereas query strings are not and are in fact case sensitive).
 *
 */

class AuthenticationHelper {

  /**
   * Authenticates a request given the definition and the security values passed in by the requester.
   *
   * This method will either THROW an HttpError (401 Not Authorized or 501 Not Implemented)
   * or it will simply return. The caller can assume that if the method returns, then the request
   * either did not require authentication or successfully authenticated.
   *
   * @param req
   * @param res
   */
  static authenticateOrThrow(req, res) {
    // Get the details of the security scheme defined for the request. This could be null, in which case
    // the request does not require any authentication.
    const securitySchemeDetails = this.getSecuritySchemeDetails(req);
    if (!securitySchemeDetails) {
      // No security in this one, so no further work is needed.
      return;
    }

    // Otherwise, we do have a Security Scheme, so let's authenticate or Throw.

    // Let's figure out auth type, where it is, what it's called
    // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#securitySchemeObject
    // The type of the security scheme. Valid values are "basic", "apiKey" or "oauth2".
    switch (securitySchemeDetails.type) {
      case 'basic':
        throw new HttpError(501,'Authentication type "basic" is not implemented.');
        break;
      case 'apiKey':
        const requestApiKey = this.getSecurityApiKey(req, securitySchemeDetails.in, securitySchemeDetails.name);
        const hasValidRequestSecurity = this.isValidApiKey(requestApiKey);
        if (!hasValidRequestSecurity) throw new HttpError(401,'Not Authorized');
        break;
      case 'oauth2':
        throw new HttpError(501,'Authentication type "oauth2" is not implemented.');
        break;
      default:
        throw new HttpError(501,`Authentication type "${securitySchemeDetails.type}" is not supported by the Swagger 2 specification.`);
    }

  }

  /**
   * Verify an API Key and decide if it's valid.
   *
   * @param requestApiKey
   * @returns boolean - true for valid key or false for invalid key
   */
  static isValidApiKey(requestApiKey) {
    // TODO: Implement better key authentication than a static string
    return requestApiKey === 'abc123';
  }

  /**
   * Gets an API key from a request given the location and name. If somehow the location
   * is not a value supported by the specification, this returns null;
   *
   * Mirrors the Swagger 2 spec at https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#securitySchemeObject
   *
   * @param req
   * @param apiKeyLocation - The location of the API key. Valid values are "query" or "header".
   * @param apiKeyName - An arbitrary string.
   */
  static getSecurityApiKey(req, apiKeyLocation, apiKeyName) {
    // A placeholder for our key
    let apiKey;
    // Fetch they key depending on where the definition tells us to find it
    switch (apiKeyLocation) {
      case 'query':
        // Note, query parameters per the Swagger 2 spec are case-sensitive
        apiKey = req.query[apiKeyName];
        break;
      case 'header':
        // Note, headers are always in lowercase
        apiKey = req.headers[apiKeyName.toLowerCase()];
        break;
    }
    // return it
    return apiKey;
  }

  /**
   * Gets the details of the Security Scheme for the request. First figures out what security
   * scheme the request is configured for, if any. Then inspects the Swagger definition for the
   * API to pull the details of the scheme in use by the request.
   *
   * The Scheme Details object is defined in the Swagger 2 spec at
   * https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#securitySchemeObject
   *
   * For ApiKey, the object is very simple:
   * { "type": "apiKey", "in": "header|query", "name": "the-name-here" }
   *
   * @param req
   * @returns {null|*}
   */
  static getSecuritySchemeDetails(req) {
    // Get the name of the security scheme the request is defined to use.
    const requestFirstSecuritySchemeName = this.getFirstRequestSecuritySchemeName(req);
    // If we have a name, pull the details of that scheme from the Swagger definition for the API
    if (requestFirstSecuritySchemeName) {
      // We have one to return, so return it
      return req.swagger.api['securityDefinitions'][requestFirstSecuritySchemeName];
    } else {
      // There was no security scheme defined for the request, so return null
      return null;
    }

  }

  /**
   * Gets the first security scheme in the request's Swagger metadata.
   * Note, this is the name of the security scheme, which we then get details of
   * using another method.
   *
   * TODO: This could be made more robust by supporting Multiple Schemes as implemented by the Swagger 2 specification.
   *
   * @param req
   * @returns {null|string}
   */
  static getFirstRequestSecuritySchemeName(req) {
    let firstSecuritySchemeName;
    try {
      // Map in the security definition for the request
      const securityObject = req.swagger.security;
      let firstSecurityScheme;
      // If it's an array with any entries (it's always an array)
      // we pull out the name of the scheme.
      if (securityObject.length >= 1) {
        // Grab the first one. This could be better! See the comment above.
        firstSecurityScheme = req.swagger.security[0];
        // Returns the first key of the first object, coercing to a string.
        firstSecuritySchemeName = Object.keys(firstSecurityScheme)[0].toString();
      }
    } catch (ex) {
      // Just ignore errors in parsing out the security scheme name
      // Is this safe? It should be since the req.swagger.security object is in fact
      // created by the Swagger-Express-Middleware and not data sent by the remote client.

      // This means that it should not really fail ever, but playing it safe since there's
      // a bit of hackery about with the whole "first scheme name".

      console.log(`getFirstRequestSecuritySchemeName was not able to get the security scheme for the request to ${req.swagger.pathName}`);
    }

    return firstSecuritySchemeName;
  }

}

module.exports = AuthenticationHelper;