require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const urlRoutes = require('./routes/urlRoutes');
const { redirectUrl } = require('./controllers/urlController');

const app = express();

// ✅ Updated CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    // Allow localhost (development)
    if (origin.includes('localhost')) {
      return callback(null, true);
    }

    // Allow all Vercel deployments (preview + production)
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));

// Routes
app.use('/api', urlRoutes);
app.get('/:code', redirectUrl);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const DBconnect = require('./database/DBconnect');

DBconnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database connected successfully`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });