'use strict';
// Development specific configuration
// ==================================
module.exports = {
    db_url: process['env']['development_url'],
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    debug: false
  };
