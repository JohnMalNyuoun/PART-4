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