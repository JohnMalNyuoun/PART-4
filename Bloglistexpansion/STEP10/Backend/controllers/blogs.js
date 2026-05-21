const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');
const middleware = require('../utils/middleware');

// GET: Fetch all blogs (Public route, no token required)
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

// POST: Create a new blog (Protected route, requires valid token)
blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body;
  const user = request.user; // Populated by userExtractor middleware

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  });

  try {
    // 1. Save the blog first to catch any validation errors before altering user data
    const savedBlog = await blog.save();
    
    // 2. Link the saved blog's ID to the user and update the user document
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    
    response.status(201).json(savedBlog);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// DELETE: Remove a blog (Protected route, only creator can delete)
blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user; // Populated by userExtractor middleware
  const blog = await Blog.findById(request.params.id);

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' });
  }

  // Verify that the user attempting deletion matches the creator of the blog
  if (blog.user.toString() !== user._id.toString()) {
    return response.status(401).json({ error: 'only the creator can delete a blog' });
  }

  try {
    // 1. Delete the blog resource
    await Blog.findByIdAndDelete(request.params.id);
    
    // 2. Filter out the deleted blog's reference ID from the creator's profile
    user.blogs = user.blogs.filter(b => b.toString() !== blog._id.toString());
    await user.save();
    
    response.status(204).end();
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

module.exports = blogsRouter;
