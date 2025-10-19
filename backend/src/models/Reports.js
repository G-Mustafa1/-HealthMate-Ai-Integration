const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: String,
    summary: String,
    aiExplanation: String,
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: 'reports',
    timestamps: true
  }
);

const Report = mongoose.model('Report', reportSchema);
module.exports = { Report };
