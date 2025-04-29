const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

// Extract YouTube video ID from URL
exports.getYoutubeVideoId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match && match[1];
};

// Download YouTube video as audio
exports.downloadYoutubeAudio = async (url, filename) => {
  const videoId = exports.getYoutubeVideoId(url);
  
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  
  const outputPath = path.resolve(__dirname, '../uploads', filename);
  
  return new Promise((resolve, reject) => {
    ytdl(url, { 
      quality: 'highestaudio',
      filter: 'audioonly' 
    })
      .pipe(fs.createWriteStream(outputPath))
      .on('finish', () => resolve(outputPath))
      .on('error', reject);
  });
};
