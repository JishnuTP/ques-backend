const Podcast = require('../models/Podcast');
const Project = require('../models/Project');
const { getYoutubeVideoId, downloadYoutubeAudio } = require('../utils/youtubeHelper');
const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const parser = new Parser();

// @desc    Upload podcast file
// @route   POST /api/podcasts/upload
// @access  Private
exports.uploadPodcast = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { title, description, projectId } = req.body;

    // Check if project exists and belongs to user
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Create podcast
    const podcast = await Podcast.create({
      title,
      description,
      project: projectId,
      user: req.user._id,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadType: 'file',
      duration: 0 // This would be updated with actual duration after processing
    });

    res.status(201).json(podcast);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload podcast from YouTube
// @route   POST /api/podcasts/youtube
// @access  Private
exports.uploadFromYoutube = async (req, res) => {
  try {
    const { youtubeUrl, title, description, projectId } = req.body;

    // Check if project exists and belongs to user
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const videoId = getYoutubeVideoId(youtubeUrl);
    
    if (!videoId) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    const filename = `youtube-${videoId}-${Date.now()}.mp3`;
    
    // Download YouTube audio
    // In production, this would be a background job
    const filePath = await downloadYoutubeAudio(youtubeUrl, filename);
    
    // Create podcast
    const podcast = await Podcast.create({
      title: title || 'YouTube Import',
      description: description || '',
      project: projectId,
      user: req.user._id,
      fileUrl: `/uploads/${filename}`,
      youtubeUrl,
      uploadType: 'youtube',
      duration: 0 // This would be updated with actual duration after processing
    });

    res.status(201).json(podcast);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Import podcast from RSS feed
// @route   POST /api/podcasts/rss
// @access  Private
exports.importFromRSS = async (req, res) => {
  try {
    const { rssFeedUrl, episodeIndex, projectId } = req.body;

    // Check if project exists and belongs to user
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Fetch and parse RSS feed
    const feed = await parser.parseURL(rssFeedUrl);
    
    if (!feed.items || feed.items.length === 0) {
      return res.status(400).json({ message: 'No episodes found in RSS feed' });
    }
    
    // Select episode
    const episode = episodeIndex && feed.items[episodeIndex] ? feed.items[episodeIndex] : feed.items[0];
    
    // Create podcast
    const podcast = await Podcast.create({
      title: episode.title || 'RSS Import',
      description: episode.contentSnippet || episode.content || '',
      project: projectId,
      user: req.user._id,
      rssFeedUrl,
      uploadType: 'rss',
      duration: 0 // This would be updated with actual duration after processing
    });

    res.status(201).json(podcast);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all podcasts for a project
// @route   GET /api/podcasts/project/:projectId
// @access  Private
exports.getPodcastsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if project exists and belongs to user
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const podcasts = await Podcast.find({ project: projectId });
    
    res.json(podcasts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a podcast by ID
// @route   GET /api/podcasts/:id
// @access  Private
exports.getPodcastById = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }
    
    // Check if user owns the podcast
    if (podcast.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(podcast);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a podcast
// @route   DELETE /api/podcasts/:id
// @access  Private
exports.deletePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }
    
    // Check if user owns the podcast
    if (podcast.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Delete file if it exists locally
    if (podcast.fileUrl && podcast.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', podcast.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await podcast.deleteOne();
    
    res.json({ message: 'Podcast removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};