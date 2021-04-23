/**
 * This is the main config object for the server.
 * However, this defines the schema and loads the
 * proper JSON5 config file from the '/config/
 * directory. Therefore, config values should be
 * created inside config files named to match
 * the NODE_ENV environment that will be used
 * to run the server.
 *
 * This module supports JSON5 configurations.
 * Learn more about JSON5 at https://spec.json5.org
 */

/**
 * Dependencies
 */
const convict = require('convict');
const json5 = require('json5');

/**
 * Parsers.
 * Note we support JSON5 with the extension json5.
 */
convict.addParser([{ extension: 'json5', parse: json5.parse }]);

/**
 * Define the Config Schema
 */
const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['prod', 'dev', 'test'],
    default: 'dev',
    // This property can be overriden from the NODE_ENV
    env: 'NODE_ENV',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8000,
    // This property can be overriden from the NODE_ENV
    env: 'PORT',
  },
  hostname: {
    doc: 'The hostname to display in messages.',
    format: '*',
    default: 'localhost',
  },
  swaggerSpecPath: {
    doc: 'The file path that contains your Swagger definition (YAML in Swagger 2 / OpenAPI 2 syntax.)',
    format: '*',
    default: './api/swagger.yaml',
  },
  useApiBasePathInRoutes: {
    doc: 'Tells the API Router whether to use the basePath from your Swagger definition document when setting ' +
      'up the routes.',
    format: '*',
    default: false,
  },
  apiDocsFilesRoute: {
    doc: 'The URI route that will respond with the API specification (in JSON format). Leave' +
      'empty or set to NULL to disable the feature (in which case the JSON format will not be published.)' +
      'Must be unique and different from the other property apiDocsUiRoute.',
    format: '*',
    default: '/api-docs/',
  },
  apiDocsUiRoute: {
    doc: 'The URI route that will respond with the API specification (Swagger UI). Leave' +
      'empty or set to NULL to disable the feature (in which case the Swagger UI will not be exposed.)' +
      'Must be unique and different from the other property apiDocsFilesRoute.',
    format: '*',
    default: '/api-docs-ui/',
  },
  favicon: {
    doc: 'The location to fetch the favicon from.',
    format: '*',
    default: './static/favicon.ico',
  },
});

/**
 * Load environment dependent configuration
 */
const env = config.get('env');
config.loadFile('./config/' + env + '.json5');

/**
 * Perform validation
 */
config.validate({ allowed: 'strict' });

/**
 * Export the config for access from anywhere!
 */
module.exports = config;
