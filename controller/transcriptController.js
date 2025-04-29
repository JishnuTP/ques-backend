const Transcript = require('../models/Transcript');
const Podcast = require('../models/Podcast');
const Project = require('../models/Project');

// @desc    Generate transcript for podcast (mock)
// @route   POST /api/transcripts/generate/:podcastId
// @access  Private
exports.generateTranscript = async (req, res) => {
  try {
    const { podcastId } = req.params;
    
    // Check if podcast exists and belongs to user
    const podcast = await Podcast.findById(podcastId);
    
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }
    
    if (podcast.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Check if transcript already exists
    let transcript = await Transcript.findOne({ podcast: podcastId });
    
    if (transcript) {
      return res.status(400).json({ message: 'Transcript already exists for this podcast' });
    }
    
    // In a real app, we would initiate a background job to process the audio and generate a transcript
    // Here, we'll create a mock transcript with sample data
    const mockSegments = [
      {
        text: 'Hello and welcome to our podcast.',
        startTime: 0,
        endTime: 3.5,
        speaker: 'Speaker 1'
      },
      {
        text: 'Today we will be discussing MERN stack development.',
        startTime: 3.5,
        endTime: 7.2,
        speaker: 'Speaker 1'
      },
      {
        text: 'Absolutely, it\'s a fascinating topic.',
        startTime: 7.2,
        endTime: 10.8,
        speaker: 'Speaker 2'
      }
      // More segments would be added in a real implementation
    ];
    
    transcript = await Transcript.create({
      podcast: podcastId,
      segments: mockSegments
    });
    
    res.status(201).json(transcript);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get transcript by podcast ID
// @route   GET /api/transcripts/podcast/:podcastId
// @access  Private
exports.getTranscriptByPodcast = async (req, res) => {
  try {
    const { podcastId } = req.params;
    
    // Check if podcast exists and belongs to user
    const podcast = await Podcast.findById(podcastId);
    
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }
    
    if (podcast.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const transcript = await Transcript.findOne({ podcast: podcastId });
    
    if (!transcript) {
      return res.status(404).json({ message: 'Transcript not found' });
    }
    
    res.json(transcript);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update transcript segments
// @route   PUT /api/transcripts/:id
// @access  Private
exports.updateTranscript = async (req, res) => {
  try {
    const { segments } = req.body;
    
    const transcript = await Transcript.findById(req.params.id);
    
    if (!transcript) {
      return res.status(404).json({ message: 'Transcript not found' });
    }
    
    // Check if user owns the transcript
    const podcast = await Podcast.findById(transcript.podcast);
    
    if (!podcast) {
      return res.status(404).json({ message: 'Associated podcast not found' });
    }
    
    if (podcast.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    transcript.segments = segments || transcript.segments;
    transcript.isEdited = true;
    transcript.lastEditedAt = Date.now();
    
    const updatedTranscript = await transcript.save();
    
    res.json(updatedTranscript);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};