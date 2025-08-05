const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GLOBAL = require('../service/Global');

const autoIncrement = require('mongoose-auto-increment');

const personSchema = new Schema({
    type: { type: String },
    destination: {
        type: Number,
        ref: "Motif" // references a motif by its Number _id
    }
});

const passageSchema = new Schema({

    carType: { type: String },
    persons: [personSchema],
    quantite: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1.']
    }
}, {
    timestamps: { createdAt: "date", updatedAt: false }
});
passageSchema.plugin(autoIncrement.plugin, { model: 'Passage', startAt: 1 });

const Passage = mongoose.model("Passage", passageSchema);

module.exports = Passage;
