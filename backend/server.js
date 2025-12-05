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

app.use(cors({
  origin: [
    "https://nativenest-frontend.onrender.com/",  // your actual frontend URL
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});