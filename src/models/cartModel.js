const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({

    userId: {
        type: ObjectId,
        required: true,
        ref: "User"
    },
    items: {
        type:[Object],
        required:'Items are required'
    },
    totalPrice: {
        type: Number,
        required: true,
        trim: true
    },
    totalItems: {
        type: Number,
        required: true,
    },
}, { timestamps: true })

module.exports = mongoose.model("Cart", cartSchema)