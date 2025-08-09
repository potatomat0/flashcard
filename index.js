
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
    process.exit(1); // Exit process with failure
  }
};

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/users');
const deckRoutes = require('./routes/decks');
const nestedCardRoutes = require('./routes/cards'); // Renamed for clarity
const cardActionRoutes = require('./routes/cardActions'); // --- ADD THIS

// ... app setup and middleware
app.use('/api/users', userRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/decks/:deckId/cards', nestedCardRoutes);
app.use('/api/cards', cardActionRoutes); // --- ADD THIS 


app.get('/', (req, res) => {
    res.send('Flashcard API is running at port 5001!');
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
