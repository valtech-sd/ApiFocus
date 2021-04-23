# Api Focus

Focus on your API, not on boilerplate code!

## What is this?

**Api Focus** (this project) provides a simple scaffold that can be used to **dynamically** serve a fully functioning REST API from a Swagger 2 (OpenAPI v2) definition file.

This project is 100% Swagger-definition driven! Your API's Swagger definition file provides all the configuration needed for Express to parse, validate and route your endpoints. Once implemented, change the API definition (and update your corresponding controller if necessary), and you change the API!

A functioning dynamically-driven API can be achieved in a few steps: (detailed instructions later in this document)

1. Download a copy of this project and save it to a location of your convenience.
1. Create a Swagger 2 (OpenAPI v2) definition file (in YAML format) and save it to the **api** directory.
1. Write one or more controllers to handle each path & method in your Swagger definition and drop them in the **controllers** directory.
1. Decide how you want to Authenticate requests (if needed) and implement that. 
1. Run with your favorite NodeJS runner.
1. Profit!

This framework takes your API's Swagger definition and the controllers you write and:

1. Handles all the parameter parsing and parameter validation to ensure your controllers receive exactly what the provided Swagger definition requires. This framework will show an error page with API specific information if an endpoint is called with improper parameters or request body.
1. Creates routes for your controllers (by convention, you place them in the **controllers** directory) based on your Swagger definition file.  

> **But wait, what do you mean Swagger 2 / OpenAPI 2? Why doesn't this project use OpenAPI 3?**
> Keen observer you are, young Luke! You're right. OpenAPI 3 is indeed out there and it might even be better. (I mean, v3 is always better than v2, right?) 
> However, since OpenAPI 3 is newer, there is not as much support for it in the libraries that this project relies on. We'll be sure keep an eye out for OpenAPI 3 
> support and update this project as soon as it's possible to do so! In the meantime, hey, Swagger 2 / OpenAPI 2 works pretty good so you should check it out!

### Where will this work?

I have tested this framework in NodeJS 14.x on macOS. This likely works just fine with other versions and operating systems, but that will be dependent on each of the dependent libraries. See [Dependencies](#dependencies).

### To Production or not to Production, that is the question?

This project ultimately relies on Express and other libraries. To the best of our knowledge, none are unsuitable for Production. See [Taking this project to a Production environment](#taking-this-project-to-a-production-environment) for more details. 

## Getting Started with the Provided Example

To use this project's main example, simply perform the following steps:

1. Download the project to some location of your choice.
1. From the command line on the root of the project, install dependencies with `npm i`.
1. Start the server with `npm start`.

Once the example server starts, direct your browser to any of the following:

- http://localhost:8000/api-docs-ui/ - to see the Swagger UI documentation for the Example API provided.
- http://localhost:8000 - To see the live PING, which should show you your local date/time in JSON format, indicating that the server is running.

You can also send off CURLs (or use your favorite API client) against your running server to access the example endpoints. See [Example CURLs](README-EXAMPLE-CURLS.md).

## Making this project "Your Own" (Serving your own API)

### 1. Download this repo

Begin with a download of this repo. Save it to some location on your hard drive.

Once you have this copy, you'll bring in your Swagger definition YAML file and your controllers.

### 2. Create a Swagger 2 Definition for your API

The easiest way to create a Swagger 2 (OpenAPI v2) definition file is to use the free Swagger Editor.

The options for running Swagger Editor are:

- Cloud on SwaggerHub (they do have free accounts for Public APIs). Learn more at [SwaggerHub](https://swagger.io/tools/swaggerhub/). 
- Local on your Workstation or via a Docker Container. Clone the Swagger Editor repo and follow the instructions from the [Swagger Editor GitHub Repo](https://github.com/swagger-api/swagger-editor).

However, using the Swagger Editor is not strictly necessary so long as your file conforms to the Swagger 2 schema. You can learn more about [Swagger 2 (OpenAPI v2)](https://swagger.io/docs/specification/2-0/basic-structure/).

**MAP YOUR CONTROLLERS** 

This project uses information in your Swagger API definition to properly map controllers and methods for each path and method in your definition. Simply include the following two properties for each path and method:

- x-swagger-router-controller: NameForYourControllerFile
  - Must match a Controller file in the Controllers directory. Do not include the ".js" extension of the file.
  - Though controller files can be nested in subdirectories, their names must be unique. See the [Roadmap](#roadmap) if you're interested in more about this. 
- operationId: nameOfYourMethod
  - Must match a static method in the Controller file with the signature (req, res). See what a controller needs to look like in the next section of this document.

Once you have a Swagger 2 definition, drop it into the **api** directory of this project. If you name it **swagger.yaml** the default config will pick it up automatically. Otherwise, add the name in your environment's config. For example for NODE_ENV=dev, set your **./config/dev.json5** to:
```json
{
  swaggerSpecPath: './api/yourFileName.yaml'
}
```

### 3. Create Controllers

Each Path and Method (GET, POST, HEAD, DELETE, etc) in your Swagger definition must match to a Controller file and method in your code.

Here is a skeleton method that you can use to create all of yours:

```javascript
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
    // You do your work here... and eventually return whatever your API needs to!
    // For Example:
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
```
> **Note:** This project ships with example Controllers in the **Controllers** directory.

Remember, you map controllers via your Swagger API definition. See [2. Create a Swagger 2 Definition for your API](#2-create-a-swagger-2-definition-for-your-api) if you missed how to do this.

### 4. Implement Authentication (if you need it)

This project includes an example authenticator implemented in both the Swagger definition and the class **AuthenticationHelper**. It's a basic example of using an apikey that checks against a constant value. Obviously this is not something super-secure that you'd want to use in most cases.

If your API requires authentication, be sure to implement something that works for you. Note, there's nothing wrong with an apikey header approach given you implement some validation of those keys that suits your needs.

Be sure to review the [Swagger 2 Authentication](https://swagger.io/docs/specification/2-0/authentication/) for more information.

What does this look like in the Swagger file? Notice how in the **definitions** section, we create an **ApiKeyAuth** security scheme set to the Swagger type **apiKey** and configured to use a header called **apiKey**. It looks like this:

```yaml
securityDefinitions:
  ApiKeyAuth:
    type: apiKey
    in: header
    name: apikey
```

Then, for any endpoints where we want to enforce this security scheme, we include the property **security** which is an array of security schemes that the endpoint requires. It looks like this in the **/echo_secured** endpoint:

```yaml
  /echo_secured:
    post:
      tags:
        - auth required
      summary: Echo Reply
      description: |
        Replies with whatever body is passed into the post.
      security:
        - ApiKeyAuth: []
```

With the above setup, any endpoints that include **security** will need to be called with a header called **apikey** set to the proper value. (For this example, the value 'abc123').

For example, here is a CURL call that would work:

```bash
curl --location --request POST 'http://localhost:8000/echo_secured' \
--header 'apikey: abc123' \
--header 'Content-Type: application/json' \
--data-raw '{
  "echoMessage": "Hi there.",
  "outputTimestamp": true
}'
```

Notice that the Swagger 2 specification for Security is complex and multiple schemes are supported by the spec or any one endpoint. However, in this example we assume (and use) only the first authentication scheme we find in a request (since we're only using one in the definition). We then look that up in the API definition to figure out the kind of authentication that it represents from the Swagger supported types.

Refer to **AuthenticationHelper.js** for the details. Also, notice the entry in the [Roadmap](#roadmap) for an enhancement around supporting multiple security schemes (which is after all part of the Swagger 2 specification.)

> **Note:** This project ships with an example Controller in the **Controllers** directory called **EchoSecuredController** that implements ApiKey authentication.

### 5. Start the server

For development purposes, we included a start script:
```bash
$ npm start
```

> **Note:** The included start script uses Nodemon which is suitable for development only. Nodemon is awesome because when you make changes to most of your files, the server will automatically restart. See the section on how to take this project to Production for how to run in Production environments.

### 6. Profit!

Sit back, relax and then tell your boss how hard you worked for weeks to build your API.

> **Note:** No, you should not lie about how long your API took. However, you can make it that much better in the parts that count, which is in the controllers! You're welcome! 

## Taking this project to a Production environment

To take a project based on this scaffold into production, there are no special requirements introduced by this project other than perhaps whatever is a best practice for NodeJS.

Steps you should take include things like (not an exhaustive list):

- You'll want to use something other than Nodemon to run the app. Docker, PM2 are two great ways to run NodeJS in production environments.
- Depending on your setup and needs, you might want to front NodeJS by Nginx, Apache or some other web server, maybe even an API gateway of some sort.
- Implement authentication suitable for your needs. The example here uses a basic ApiKey in a header checked against a constant. There's nothing wrong with an ApiKey approach, but a constant is not something you'll want to do in production!
- Setup a **prod.json5** file and set your settings, including deciding if you want to expose your API specification file and Swagger-UI.

For much more information on taking a NodeJs app into production, consider a [Duck-Duck-Go](https://duckduckgo.com/?q=nodejs+in+production&t=osx&ia=web) search for [nodejs in production](https://duckduckgo.com/?q=nodejs+in+production&t=osx&ia=web). 

## Dependencies

This project relies on the following open-source software for its various features related to Swagger support. You really should check each of them out and STAR them on GitHub. Each of these projects perform amazing functions without which API Focus would not exist!

- NodeJS with Express
  - Provides the foundation for the app including the http server, middleware, routing, etc.
  - learn more about [Express](https://github.com/expressjs/express).
- Swagger 2 / OpenApi 2
  - All the tools require an API Definition in the Swagger 2 (OpenAPI v2) syntax. Unfortunately, most of the tools are not yet OpenAPI 3 compatible.
  - Learn more about [Swagger 2 (OpenAPI v2)](https://swagger.io/docs/specification/2-0/basic-structure/).
- swagger-express-middleware
  - Uses a Swagger Definition File (Swagger/OpenAPI 2) to wire up Express Middleware that parses and validates the incoming requests.
  - This ensures that all calls to the API are passed the proper parameters as described in the Swagger definition.
  - Learn more about [swagger-express-middleware](https://github.com/APIDevTools/swagger-express-middleware).
- swagger-express-router
  - Creates routes for the API as specified in the Swagger definition.
  - Each Path & Method in your Swagger definition must have two properties that declare the Controller file and Method that supports the particular path and method. See the section [2. Create a Swagger 2 Definition for your API](#2-create-a-swagger-2-definition-for-your-api) for more information.
  - Note that we provide in this project a **SwaggerRouterHelper** class to dynamically find all the controller files in the **controllers** directory. This is an enhancement that is not included in swagger-express-router. 
  - Learn more about [swagger-express-router](https://github.com/scottie1984/swagger-express-router).
- swagger-ui-express
  - Creates a documentation UI based on the Swagger definition and exposes it via several static routes:
    - /api-docs-ui/ - is an HTML Swagger UI for your API
    - /api-docs/ - is the JSON format of the Swagger definition, even though you provide a YAML format (this is what the library supports.)
  - Learn more about [Swagger UI](https://swagger.io/tools/swagger-ui/).
  
There are also additional packages used, all of which equally awesome, but unrelated to Swagger. Check out the project's **package.json** for the full list.
        
## Roadmap

Do projects ever "finish"? Meh. Here is a list of features that occurred to us that this project might want to include at some point.

- Add basic authentication example to AuthenticationHelper.
- Add example of Oauth to AuthenticationHelper.
- Enhance the AuthenticationHelper to support multiple Security Schemes as defined in the Swagger 2 specification (schemes can be "any one of" or even combinations.)
- Validate API responses against the Swagger definition to make sure the API responded properly. Right now, the underlying controllers can respond with anything which could cause problems for clients! Could respond with HTTP 500 "internal server error". For now, clients should implement SCHEMA checking using the Swagger definition file. This can be done with SwaggerHub, Postman and other API tools using the Swagger definition for the API.
- A better way to catch that the swagger specification has x-swagger-router-controller or operationId that can't be mapped to a controller, with individual error. Perhaps a validator that runs before we try to map routes and identifies which controllers are missing. Right now, this is one TRY/CATCH which leaves the developer guessing which controller might be missing, has a bad name, or is not implemented properly.
- An opinion and documentation on testing for the controllers.
- Implement tests for the scaffold.
- An opinion and documentation for supporting API versions. For instance, it could support various Swagger definitions on startup (per config) and then pick the proper controller directory, also using a version path (perhaps also base path inside each swagger definition). Could we even support multiple versions side-by-side, or at least the ability to decide which versions are supported. Requirements need to be defined and an architecture designed and implemented.
- Does it make sense to allow Controllers with the same Name (nested in subdirectories)? If so, implement a mechanism for nested controllers inside subdirectories in the controllers directory that avoids collisions. (At present, all subdirectories are parsed but the controller names need to be unique regardless of directory depth. The behavior of identically named Controller files has not been carefully considered.)
- Typescript version of the project, or at least, how to use Typescript with it?
- (low priority, risky) Does it make sense to bring in Swagger Editor into this framework? Probably not since that brings authentication needs. (You would not want anyone editong your Swagger definition.) This is also simple enough to do with a standalone NodeJS project or even a local Docker (or using SwaggerHub).
- Add a CONTRIBUTING section to the readme with a process for others to help with this project.