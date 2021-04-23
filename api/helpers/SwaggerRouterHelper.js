'use strict';

const fs = require('fs');
const path = require('path');

/**
 * A helper to create a Controllers Object in the format needed
 * for Swagger-Express-Router.
 *
 * Should be called in the main app.js. This will create a controllers object
 * to be passed into SwaggerRouter.
 */
class SwaggerRouterHelper {
  /**
   * The main method for the SwaggerRouterHelper class.
   *
   * The object returned is in the form:
   * {
   *   SomeControllerName: [contents of the controller file via REQUIRE],
   *   SomeOtherControllerName: [contents of the controller file via REQUIRE]
   * }
   *
   * @param controllersPath - relative to the location of "this" helper!
   * @returns {*|{}}
   */
  static enumerateControllers(controllersPath = '../controllers/') {
    // Properly resolve the path that contains the Controllers
    const controllerRootPath = path.join(__dirname, controllersPath);
    // Start with an empty object
    let controllersObject = {};
    // Enumerate by parsing into the main Controllers Path
    controllersObject = SwaggerRouterHelper.parseDirectories(
      controllerRootPath,
      controllersObject
    );
    // Return the object
    return controllersObject;
  }

  /**
   * A recursive method that crawls a directory looking for JS files and
   * adds them to an object that lists them all together.
   *
   * This was inspired by https://github.com/DanWahlin/express-convention-routes
   *
   * The main flow of this method is:
   * - Inspect the directory passed (always starts with a directory)
   * - Enumerate each "item" in that directory
   * - If the item is a file that ends in '.js', adds it to the list of controllers
   * - If the item is a directory, recursively scans into that directory looking for more controllers
   *
   * @param directoryPath
   * @param controllersObject
   * @returns {*}
   */
  static parseDirectories(directoryPath, controllersObject) {
    // Iterate over each item in the passed directory
    fs.readdirSync(directoryPath).forEach(function (fileListItem) {
      // Prepares the full name for the file (including the directory)
      let fullName = path.join(directoryPath, fileListItem);
      // Is the item a directory?
      let stat = fs.lstatSync(fullName);
      if (stat.isDirectory()) {
        // It is a directory, so recursively walk into it!
        controllersObject = SwaggerRouterHelper.parseDirectories(
          fullName,
          controllersObject
        );
      } else if (path.extname(fileListItem) === '.js') {
        // Otherwise, found a .js controller fileListItem so register it
        controllersObject = {
          ...controllersObject,
          [path.basename(fullName, '.js')]: require(fullName),
        };
      }
    });
    // return the enumerated controllers up the chain
    return controllersObject;
  }
}

module.exports = SwaggerRouterHelper;
