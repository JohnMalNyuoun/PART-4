const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const user = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

const token = request.token
const decodedToken = jwt.verify(token, process.env.SECRET)

if(! token || !decodedToken.id) {
  return response.status(401).json({ error: 'token missing or invalid' })
}






  const user = await user.findById(decodedToken.id)
  const userId = user[0]

  const blog =new Blog ({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: userId._id

  })

user.blogs = user.blogs.concat(blog._id)
await user.save()
  try {
    const savedBlog = await blog.save()
    userId.blogs = userId.blogs.concat(savedBlog._id)
    await userId.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const blog = {
    title,
    author,
    url,
    likes
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id, 
      blog, 
      { new: true, runValidators: true, context: 'query' }
    )
    
    if (updatedBlog) {
      response.json(updatedBlog)
    } else {
      response.status(404).end()
    }
  } catch (exception) {
    response.status(400).end()
  }
})

module.exports = blogsRouter
