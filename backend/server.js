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

app.use(cors());
app.use(express.json());

// Add routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/viewproperties', viewPropertyRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', userRoutes); 
app.use('/api/blogs', blogRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));