const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    default: "new"
  },
  experience: {
    type: Number,
    default: 0
  },
  resumeUrl: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("candidates", candidateSchema);
