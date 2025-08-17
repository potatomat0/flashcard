const fs = require('fs');
const path = require('path');

// Đọc .env file 
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const firstEquals = line.indexOf('=');
    if (firstEquals !== -1) {
      const key = line.slice(0, firstEquals).trim();
      const value = line.slice(firstEquals + 1).trim();
      if (key) {
        process.env[key] = value;
      }
    }
  });
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


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
