const express = require('express');
const mongoose = require('mongoose');
const bodyParsingMiddleware = require('./middleware/bodyParsingMiddleware'); 
const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware');
const authMiddleware = require('./middleware/authMiddleware'); // Import authMiddleware

const app = express();

// Middleware (Order matters!)
app.use(bodyParsingMiddleware); 
app.use(authMiddleware); // Apply authMiddleware globally

// Routes - Import your route files
const blogPostRoutes = require('./routes/blogPostRoutes'); 
const userRoutes = require('./routes/userRoutes');

// Apply Routes
app.use('/blog', blogPostRoutes);
app.use('/users', userRoutes);

// Error Handling Middleware (Should be last)
app.use(errorHandlerMiddleware);
// MongoDB connection
connect('mongodb://localhost:27017/Blogs', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
.then(() => {
    // Start the server after successful database connection
    app.listen(3000, () => console.log('Server running on port 3000')); 
})
.catch(err => console.error('Error connecting to MongoDB:', err));
