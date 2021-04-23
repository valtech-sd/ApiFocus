'use strict';

/**
 * The controller for the path '/'.
 */
class IndexController {
  /**
   * Implementation for path '/' method GET.
   * @param req - the Express request object (enhanced with req.swagger) by swagger-express-middleware
   * @param res - the Express response object
   */
  static indexGet(req, res) {
    // Set a good status
    res.status(200);
    // Set our content type out
    res.type('application/json');
    // Prepare a response object
    const pingResponse = {
      ping: 'OK',
      timestamp: Math.floor(new Date().getTime() / 1000.0),
    };
    // Respond
    res.send(JSON.stringify(pingResponse));
  }
}

module.exports = IndexController;
