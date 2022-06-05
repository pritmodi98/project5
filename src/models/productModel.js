const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

        title: {
            type: String,
            required: true,
            Unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            trim: true
        },
        currencyId: {
            type: String,
            required: true //It should be in INR
        },
        currencyFormat: {
            type: String,
            required: true,
            trim: true //Rupee Symbol should be there
        },
        isFreeShipping: {
            type: Boolean,
            default: false
        },
        productImage: {
            type: String,
            required: true
        },
        style: {
            type: String,
        },
        availableSizes: [{ type: [String], enum: ["S", "XS", "M", "X", "L", "XXL", "XL"] }],
        installments: {
            type: Number,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        isDeleted: {
            type: Boolean,
            default: false
        },

    }, { timestamps: true }) // created at , updatedat

module.exports = mongoose.model("Product", productSchema)