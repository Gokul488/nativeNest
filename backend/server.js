require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const propertiesRoutes = require('./routes/propertiesRoutes');
const contactRoutes = require('./routes/contactRoutes');
const viewPropertyRoutes = require('./routes/viewPropertyRoutes');
const userRoutes = require('./routes/userRoutes'); 
const blogRoutes = require('./routes/blogRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const buyerEventRoutes = require('./routes/buyerEventRoutes');
const bookmarksRoutes = require('./routes/bookmarksRoutes');
const builderRoutes = require('./routes/builderRoutes');
const stallRoutes = require('./routes/stallRoutes');

const app = express();

app.use(cors({
  origin: [
    "https://nativenest-frontend.onrender.com",  // your actual frontend URL
    "http://localhost:5173"                 // for local dev
  ],
  credentials: true
}));
app.use(express.json());

// Add routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/viewproperties', viewPropertyRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', userRoutes); 
app.use('/api/blogs', blogRoutes); 
app.use('/api', adminRoutes);
app.use('/api', eventRoutes);
app.use('/api', buyerEventRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api', builderRoutes)
app.use('/api/stalls', stallRoutes);

// Health check endpoint
app.get('/health-db', async (req, res) => {
  try {
    const pool = require('./db');
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: rows[0].ok });
  } catch (err) {
    console.error('health-db error', err);
    res.status(500).json({
      error: 'DB connection failed',
      detail: err.message
    });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});