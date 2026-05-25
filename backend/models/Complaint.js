const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'Cleaning', 'Noise', 'Other'],
    default: 'Other',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
