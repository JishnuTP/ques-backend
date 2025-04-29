const mongoose = require('mongoose');

const TranscriptSegmentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  startTime: {
    type: Number,
    required: true
  },
  endTime: {
    type: Number,
    required: true
  },
  speaker: {
    type: String
  }
});

const TranscriptSchema = new mongoose.Schema({
  podcast: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Podcast',
    required: true
  },
  segments: [TranscriptSegmentSchema],
  isEdited: {
    type: Boolean,
    default: false
  },
  lastEditedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transcript', TranscriptSchema);