const express = require('express');
const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost');
const User = require('../models/User');
const authorizationMiddleware = require('../middleware/authorizationMiddleware');
const router = express.Router();

// Middleware for authentication (replace with your implementation)
const authMiddleware = (req, res, next) => {
    
    if (!req.isAuthenticated) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Create a new blog post
router.post('/', authMiddleware,  async (req, res) => {
    try {
        const newPost = new BlogPost({
            title: req.body.title,
            content: req.body.content,
            author: req.user._id // Get user from authentication
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create post' });
    }
});

// Get all blog posts (with optional pagination)
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const posts = await BlogPost.find()
            .populate('author', 'username')
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get a specific blog post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id).populate('author', 'username'); 
        if (!post) return res.status(404).json({ error: 'Post not found' }); 
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Update a blog post by ID
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' }); 

        // Ensure the user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to edit this post' });
        }

        post.title = req.body.title;
        post.content = req.body.content;
        await post.save();

        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Delete a blog post by ID
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' }); 

        // Authorization: Only allow the author to delete the post
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        // Deletion
        await post.remove(); // Or use BlogPost.findByIdAndDelete(...) 
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});
router.get('/search', async (req, res) => {
    const searchTerm = req.query.q;

    if (!searchTerm) {
        return res.status(400).json({ error: 'Search term (q) is required' });
    }

    try {
        const posts = await BlogPost.find({
            $text: { $search: searchTerm }
        })
        .populate('author', 'username'); 

        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});
router.get('/edit-posts', authMiddleware, authorizationMiddleware(['editor']), 
           (req, res) => { 
               // Route logic: Only accessible to authenticated users with 'editor' role 
               res.send('Edit posts here'); 
           });
router.get('/manage-users',authMiddleware,authorizationMiddleware(['admin', 'editor']), 
           (req, res) => { 
               // Route logic: Only accessible to authenticated users with 'admin' or 'editor' role 
               res.send('Manage users here');
           });  
router.get('/blog-titles', authMiddleware, authorizationMiddleware(['registered']), 
           (req, res) => { 
              
               res.send('Blog titles here'); 
           });

// Route: View full blog content (subscribed users)
router.get('/blog/:id', 
           authMiddleware, 
           authorizationMiddleware(['subscribed']), 
           (req, res) => { 
                
                res.send('Full blog content here'); 
           });                    

module.exports = router;
