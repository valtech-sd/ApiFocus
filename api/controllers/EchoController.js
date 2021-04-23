'use strict';

/**
 * The controller for the path '/echo'.
 */
class EchoController {
  /**
   * Implementation for path '/echo' method POST. Receives an echoMessage and responds with it. If the
   * request includes outputTimestamp === true, it also outputs the timestamp.
   *
   * Per the API definition, this expects:
   * - EchoRequest (Body)
   *  - echoMessage: (required)
   *  - outputTimestamp: (optional, defaults to false)
   *
   * @param req - the Express request object (enhanced with req.swagger) by swagger-express-middleware
   * @param res - the Express response object
   */
  static echoPost(req, res) {
    // Set a good status
    res.status(200);
    // Set our content type out
    res.type('application/json');
    // Prepare a response object
    let echoResponse = {
      echoMessage: req.body['echoMessage']
    };
    // Add the timestamp to it if the request asked for one
    if (req.body['outputTimestamp']) {
      echoResponse.timestamp = Math.floor(new Date().getTime() / 1000.0)
    }
    // Respond
    res.send(JSON.stringify(echoResponse));
  }
}

module.exports = EchoController;
