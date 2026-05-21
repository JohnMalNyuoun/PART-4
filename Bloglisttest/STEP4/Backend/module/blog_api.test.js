const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const mongoose = require('mongoose')

// Before running tests, clear the test database and add initial data
beforeEach(async () => {
  await Blog.deleteMany({})
  // Add some initial blogs here using Blog.insertMany([...])
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

// After all tests are done, close the database connection
after(async () => {
  await mongoose.connection.close()
})

test ( 'blog posts have unique identifier named id', async () => {
  const response = await api.get('/api/blogs')
  
  assert.ok(response.body[0].id, 'Blog post should have an "id" property')

  assert.strictEqual(response.body[0]._id, undefined )
  
})


test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Testing with Supertest',
    author: 'Test User',
    url: 'http://test.com',
    likes: 10
  }


  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

 
  const response = await api.get('/api/blogs')
  

  assert.strictEqual(response.body.length, initialBlogs.length + 1)

  const titles = response.body.map(r => r.title)
  assert.ok(titles.includes('Testing with Supertest'))
})


test('blog defaults to zero likes if property is missing', async () => {
  const newBlog = {
    title: 'Testing default likes',
    author: 'Test User',
    url: 'http://test.com'
  }


  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  
  assert.strictEqual(response.body.likes, 0)
})