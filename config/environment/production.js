'use strict';
// Development specific configuration
// ==================================
module.exports = {
  db_url: process['env']['production_url'],
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  debug: false
};
