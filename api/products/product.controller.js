'use strict';
const Joi = require('joi');
const Product = require('./product.model');
const { SUCCESS, BADREQUEST } = require('../../config/resCodes');
const { sendResponse, errReturned } = require('../../config/dto');

/**Create Product*/
exports.createProduct = async (req, res) => {
  try {
    const {name,category,price,dateAdded} = req["body"];

    const schema = Joi.object({
      name: Joi.string().required(),
      category: Joi.string().required(),
      price: Joi.number().required(),
      dateAdded: Joi.date().required(),
    });

    const { error } = schema.validate({name,category,price,dateAdded});
    if (error) return sendResponse(res, BADREQUEST, error.details[0].message);

    const product = new Product({name,category,price,dateAdded});
    await product.save();
    return sendResponse(res, SUCCESS, "Product created successfully!", product);

  } catch (error) {
    errReturned(res, error);
  }
}

/**Get all products*/
exports.getProducts = async (req, res) => {
  try {
    
    const { page = 1, limit = 10, category, sortBy } = req["query"];

    // Sorting
    const sortOptions = {};
    if (sortBy === 'price') {
        sortOptions.price = 1; // ascending
    } else if (sortBy === '-price') {
        sortOptions.price = -1; // descending
    } else if (sortBy === 'dateAdded') {
        sortOptions.dateAdded = 1; // ascending
    } else if (sortBy === '-dateAdded') {
        sortOptions.dateAdded = -1; // descending
    }

    // Pagination
    const products = await Product.find({category})
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await Product.countDocuments({category});

    return sendResponse(res, SUCCESS, "Product get successfully!",{
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      products
    });

  } catch (error) {
    errReturned(res, error);
  }
}

/**Update Product*/
exports.updateProduct = async (req, res) => {
    try {
        const {id} = req["params"];
        const {name,category,price,dateAdded} = req["body"];

        const product = await Product.findById(id);
        if(!product)
            return sendResponse(res, BADREQUEST, "Product not found!");

        const schema = Joi.object({
          name: Joi.string().required(),
          category: Joi.string().required(),
          price: Joi.number().required(),
          dateAdded: Joi.date().required(),
        });
    
        const { error } = schema.validate({name,category,price,dateAdded});
    
        if (error) return sendResponse(res, BADREQUEST, error.details[0].message);

        product.name = name;
        product.category = category;
        product.price = price;
        product.dateAdded = dateAdded;
        const updatedProject = await product.save();
        return sendResponse(res, SUCCESS, "Product updated successfully!", updatedProject);

    } catch (error) {
      errReturned(res, error);
    }
}

/**Delete Product*/
exports.deleteProduct = async (req, res) => {
    try {
        const {id} = req["params"];
        const product = await Product.findById(id);
        if (!product) return sendResponse(res, BADREQUEST, "Product not found!");
    
        const removed = await Product.findByIdAndDelete(id);
        if(removed)
            return sendResponse(res, SUCCESS, "Product deleted successfully!", removed);
        else
            return sendResponse(res, BADREQUEST, "Product not deleted!");

    } catch (error) {
      errReturned(res, error);
    }
}