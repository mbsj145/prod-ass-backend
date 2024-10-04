'use strict';
// Localhost specific configuration
// ==================================

module.exports = {
  db_url: process['env']['localhost_url'],
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  debug: false
};
