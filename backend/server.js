require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const assignmentRoutes = require('./routes/assignments');
const queryRoutes = require('./routes/query');
const hintRoutes = require('./routes/hints');
const authRoutes = require('./routes/auth');

const app = express();


app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
const corsOptions = {
  origin: "https://ciphersqlstudio-ashen.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: '10kb' }));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
const queryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { error: 'Query execution limit reached. Wait a moment.' }
});
app.use('/api/', limiter);
app.use('/api/query', queryLimiter);


app.use('/api/assignments', assignmentRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/hint', hintRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
