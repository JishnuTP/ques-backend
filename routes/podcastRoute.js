const express = require('express');
const router = express.Router();
const { 
  uploadPodcast, 
  uploadFromYoutube, 
  importFromRSS, 
  getPodcastsByProject, 
  getPodcastById, 
  deletePodcast 
} = require('../controller/podcastController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('podcastFile'), uploadPodcast);
router.post('/youtube', protect, uploadFromYoutube);
router.post('/rss', protect, importFromRSS);
router.get('/project/:projectId', protect, getPodcastsByProject);
router.route('/:id')
  .get(protect, getPodcastById)
  .delete(protect, deletePodcast);

module.exports = router;