// server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const authRoutes = require('./routes/authRoute');
const projectRoutes = require('./routes/ProjectRoute');
const podcastRoutes = require('./routes/podcastRoute');
// const transcriptRoutes = require('./routes/');

// Initialize express
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());

const corsOptions = {
  origin: "https://ques-ai-woad.vercel.app/", // Allow only this origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

// app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/podcasts', podcastRoutes);
// app.use('/api/transcripts', transcriptRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});