require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

// --- kết nối Database ---
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection ERROR: ', err.message);
    process.exit(1); 
  }
};

connectDB();

// Middleware
app.use(helmet());
app.use(cors());


// Serve static files from the 'media' directory
app.use('/media', express.static(path.join(__dirname, 'media')));

// Routes
const userRoutes = require('./routes/users');
const deckRoutes = require('./routes/decks');
const defaultDeckRoutes = require('./routes/defaultDecks');
const uploadRoutes = require('./routes/upload');
const nestedCardRoutes = require('./routes/cards'); const cardActionRoutes = require('./routes/cardActions'); 

const jsonParser = express.json();

// ... app setup và middleware
app.use('/api/users', jsonParser, userRoutes);
app.use('/api/decks', jsonParser, deckRoutes);
app.use('/api/default-decks', jsonParser, defaultDeckRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/decks/:deckId/cards', jsonParser, nestedCardRoutes);
app.use('/api/cards', jsonParser, cardActionRoutes);  


app.get('/', (req, res) => {
    res.send("Flashcard API is running at https://flashcard-rs95.onrender.com/");
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDb connection closed');
      process.exit(0);
    });
  });
});
