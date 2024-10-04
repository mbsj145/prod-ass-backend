const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    dateAdded: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);