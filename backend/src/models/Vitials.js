const mongoose = require('mongoose');
const { Schema } = mongoose;

const VitalsSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bp: String,
    sugar: String,
    weight: String,
    note: String,
    date: { type: Date, default: Date.now },
}, {
    collection: 'vitals',
    timestamps: true
});

const Vitals = mongoose.model('Vitals', VitalsSchema);

module.exports = { Vitals };
