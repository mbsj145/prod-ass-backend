'use strict';
process['env']['NODE_ENV'] = process['env']['NODE_ENV'] || 'development';

const _ = require('lodash');
const path = require('path');
const express = require('express');
const mongo = require(`./${process['env']['NODE_ENV']}`)
const isProduction = false;

const all = {
  isProduction,
  env: process['env']['NODE_ENV'],

  // Frontend path to server
  assets: express.static(__dirname + '/../../public'),
  view: path.normalize(__dirname + '/../../public/index.html'),

  // Server port
  port: process.env.PORT || 4000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data ?
  seedDB: true,


  //localhost mongo

  mongo
};

/* Export the config object based on the NODE_ENV */
/*================================================*/

module.exports = _.merge(all, require(`./${process.env.NODE_ENV}.js`) || {});
