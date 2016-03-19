# Hoist's Administration Portal #

## Getting started
Ensure you have gulp installed globally: `npm install -g gulp`

Then install dependencies with `npm install`
Then run the application in the following modes:

`gulp build [default]`
  - build static file for the application

`gulp dev`
  - runs the application over the src folder and will pickup changes made to that folder


## File Structure

* ### `lib`
  readonly store of transpiled code. Contains code generated from src so don't modify these files directly

* ### `src`
  Source code
  * #### `client`
    client side react application code
    * ##### `components`
      Raw React components
    * ##### `configuration`
      Configuration code for the React App
    * ##### `modules`
      Logic modules
    * ##### `pages`
      Entry points for the application, usually mapping to routes in the application
    * ##### `reducers`
      Redux reducer Logic
  * #### `server`
    * ##### `areas/{area}`
      controller code for mapping logic to requests
    * ##### `configuration`
      Hapi configuration classess
    * ##### `views`
      Handlebars views to send to client (usually just the one)
* ### `tests`
  Unit and integration tests
* ### `config`
  Application level configuration
* ### `tasks`
  Gulp tasks available
* ### `code-docs`
  esdoc generated code level documentation
