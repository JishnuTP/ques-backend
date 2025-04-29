const mongoose = require('mongoose');

const PodcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String
  },
  youtubeUrl: {
    type: String
  },
  rssFeedUrl: {
    type: String
  },
  duration: {
    type: Number
  },
  uploadType: {
    type: String,
    enum: ['file', 'youtube', 'rss'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Podcast', PodcastSchema);
