require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const propertiesRoutes = require('./routes/propertiesRoutes');
const contactRoutes = require('./routes/contactRoutes');
const viewPropertyRoutes = require('./routes/viewPropertyRoutes');
const userRoutes = require('./routes/userRoutes'); 
const blogRoutes = require('./routes/blogRoutes'); 
const app = express();

// Allowed origins (no trailing slashes)
const allowedOrigins = [
  'https://nativenest-frontend.onrender.com',
  'http://localhost:5173' // local dev
];

// Lightweight middleware to set CORS headers for allowed origins and handle preflight
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (origin && allowedOrigins.includes(origin)) {
    // echo the origin back so the browser accepts the response
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );

  // handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// also enable cors middleware (redundant but safe)
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS']
}));

app.use(express.json());

// Add routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/viewproperties', viewPropertyRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', userRoutes); 
app.use('/api/blogs', blogRoutes); 

// health route
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
