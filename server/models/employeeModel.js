const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  avatarUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('employee', employeeSchema);