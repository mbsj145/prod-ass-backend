/**
   * Main application routes
*/

'use strict';

module.exports = (app) => {
  app.use('/api/v1', require('./api/user'));
  app.use('/api/v1', require('./api/projects'));
  app.use('/api/v1', require('./api/tasks'));
  app.use('/api/v1', require('./api/products'));
};
