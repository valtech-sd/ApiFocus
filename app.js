'use strict';

/**
 * Dependencies
 */

// Package Dependencies
const swagger = require('@apidevtools/swagger-express-middleware');
const path = require('path');
const fs = require('fs');
const express = require('express');
const favicon = require('serve-favicon');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const swaggerRouter = require('swagger-express-router');
const HttpError = require('http-errors');

// Internal Dependencies
const GeneralErrorController = require('./api/helpers/GeneralErrorHelper');
const NotImplementedErrorController = require('./api/helpers/NotImplementedErrorHelper');
const SwaggerRouterHelper = require('./api/helpers/SwaggerRouterHelper');
const AuthenticationHelper = require('./api/helpers/AuthenticationHelper');
const config = require('./config/config.js');

/**
 * Prep Work for Swagger UI
 */

// Map in our API Definition (Swagger File, OpenAPI 2.0)
// Since we're using a config value for the Swagger Spec Path, we do this after we have a config object.
const swaggerFilePath = path.join(__dirname, config.get('swaggerSpecPath'));
// Convert the YAML version of the Swagger Spec to JSON (needed by swagger-ui)
// We could also load this via the static mapping provided by swagger-express-middleware, but
// that would be an internal HTTP call and it seems cleaner to load from the file system instead.
const swaggerDocumentJson = yaml.load(fs.readFileSync(swaggerFilePath, 'utf8'));

/**
 * Create and Configure Express to suit our needs. This must be done before
 * we bring in the OpenAPI Middleware!
 */

const app = express();

// Setup Express Router options
app.use(
  express.Router({
    // Express paths will not be case sensitive,
    // though parameters will be (per the OpenAPI spec).
    caseSensitive: false,
    // Paths can end in "/" or not and will be treated the same.
    strict: false,
  })
);

// Map static files with the built-in Express static router
// since these are not part of the API Definition.
// Note that files in the 'static' directory will be accessible
// via http://host/static/path/here
app.use('/static', express.static(path.join(__dirname, 'static')));

// Handle Favicon
app.use(favicon(path.join(__dirname, config.get('favicon'))));

// Map our Swagger UI (Default is /api-docs-ui).
// Can be set to NULL in the config to not publish the Swagger UI!
if (config.get('apiDocsUiRoute')) {
  app.use(config.get('apiDocsUiRoute'), swaggerUi.serve, swaggerUi.setup(swaggerDocumentJson));
}

/**
 * Wire in and initialize the SaggerMiddleware (OpenAPI 2)
 */

let middleware = new swagger.Middleware(app);
// Initialize Swagger Express Middleware with our Swagger file
middleware.init(swaggerFilePath, (err) => {

  // After the middleware is initialized, configure a few more middleware components

  app.use(
    // Enable Request Metadata.
    // See https://apitools.dev/swagger-express-middleware/docs/middleware/metadata.html
    middleware.metadata(),
    // Enable CORS per the API Specification or Swagger (OpenAPI 2) defaults.
    // See https://apitools.dev/swagger-express-middleware/docs/middleware/CORS.html
    middleware.CORS());

  // Wire-up to serve the API file in (default is '/api-docs/').
  // Can be set to NULL in the config to not publish the API file!
  // See https://apitools.dev/swagger-express-middleware/docs/middleware/files.html
  if (config.get('apiDocsFilesRoute')){
    app.use(
      middleware.files(app, {
        // Ensure that we override Express App's case-sensitive and strict-routing settings
        // for the Files middleware.
        caseSensitive: false,
        strict: false,
        apiPath: config.get('apiDocsFilesRoute'),
        rawFilesPath: null,
      }))
  }

  app.use(
    // Parse out the request into standard Express objects, and apply the API definition details
    // including defaults, etc.
    // See https://apitools.dev/swagger-express-middleware/docs/middleware/parseRequest.html
    middleware.parseRequest(),
    // Validate the request against the API Definition
    // See https://apitools.dev/swagger-express-middleware/docs/middleware/validateRequest.html
    middleware.validateRequest()
  );

  // A default (and early) route to Authenticate if needed, based on the Swagger API definition.
  // This should be placed BEFORE the endpoint routes to match all routes early.
  //
  // Note this will:
  // - Continue with next() if authentication is not required for a request
  // - Continue with next() if authentication is required and passes
  // - THROW HTTP 401 if Authentication fails (per the API definition)
  //
  // Calling next() ensures that other routes match, therefore implementing the needed authentication
  // for the endpoints that require it per the API definition!
  app.use((req, res, next) => {
    AuthenticationHelper.authenticateOrThrow(req, res);
    next();
  });

  // Time to enumerate controllers in preparation for creating routes

  let enumeratedControllers;
  try {
    // Enumerate the controllers in the /api/controllers/ directory in the format
    // needed for https://github.com/scottie1984/swagger-express-router
    enumeratedControllers = SwaggerRouterHelper.enumerateControllers();
  } catch (err) {
    throw new Error('Unable to enumerate the controllers in the controllers directory.');
  }

  // Time to map the enumerated controllers to routes

  try {
    // Create routes based on the Swagger Definition and attach them to the Enumerated Controllers
    // Note that in your API specification, each route and method should have the properties
    //   x-swagger-router-controller: IndexController  <- Matches a Controller file
    //   operationId: indexGet  <- Matches a static method in the Controller with the signature (req, res)
    // If you provide either parameter AND the properly named controller and method do not exist, this
    // will throw an error page HTTP 500 Internal Server Error.
    swaggerRouter.setUpRoutes(
      enumeratedControllers,
      app,
      swaggerDocumentJson,
      config.get('useApiBasePathInRoutes')
    );
  } catch (err) {
    throw new Error('Unable to match Swagger x-swagger-router-controller & operationId to the enumerated controllers in the project. Double check to ensure you have identified all controllers with their proper name in your Swagger definition and that you have placed all the controllers in the proper directory.');
  }

  // Now let's deal with the things that could go wrong

  // Default route if nothing else matches
  // Since the Swagger definition should have picked up "true" 404s (those not defined in the definition)
  // This catches endpoints that ARE in the definition, but have not been implemented in some controller code!
  app.use((req, res, next) => {
    const httpErr = new HttpError(501);
    res.status(httpErr.status);
    res.type('html');
    res.send(NotImplementedErrorController.formatError(httpErr, req));
    // Since we've sent headers and a response, we don't next() in this one!
    //next();
  });

  // Handle errors.
  // Errors could be:
  // - Bad parameters - thrown by the Swagger Middleware (Will include error status)
  // - An unhandled controller error - may not always have error status.
  app.use((err, req, res, next) => {
    // Not all errors will have a status, so let's set a default
    const errorStatus = err.status || 500;
    // Expand the error into an HttpError object
    const httpErr = new HttpError(errorStatus, err);
    res.status(httpErr.status);
    res.type('html');
    res.send(GeneralErrorController.formatError(httpErr, req));
    // Since we've sent headers and a response, we don't next() in this one!
    //next();

  });

  // And with all the things wired up, we're ready to start the app
  app.listen(config.get('port'), () => {
    console.log(
      `The Swagger API is now running at http://${config.get(
        'hostname'
      )}:${config.get('port')}`
    );
  });
});
