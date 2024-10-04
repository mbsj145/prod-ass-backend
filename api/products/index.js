'use strict';

const express = require('express');
const controller = require('./product.controller');

const router = express.Router();

/**************************  Products  ************************ */
router.get('/product', controller.getProducts);
router.post('/product', controller.createProduct);
router.put('/product/:id', controller.updateProduct);
router.delete('/product/:id', controller.deleteProduct);


module.exports = router;