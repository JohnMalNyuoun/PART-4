const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const { url } = require('node:inspector')


const User = require('../models/user')
let token = null
let userId = null

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  // Create a user
  const newUser = {
    username: 'testuser',
    name: 'Test User',
    password: 'testpass'
  }
  await api.post('/api/users').send(newUser)

  // Login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({ username: newUser.username, password: newUser.password })
  token = loginResponse.body.token

  // Get user id
  const user = await User.findOne({ username: newUser.username })
  userId = user._id

  // Add initial blogs
  const initialBlogs = [
    {
      title: 'First Blog',
      author: 'Author One',
      url: 'http://first.com',
      likes: 1,
      user: userId
    },
    {
      title: 'Second Blog',
      author: 'Author Two',
      url: 'http://second.com',
      likes: 2,
      user: userId
    }
  ]
  await Blog.insertMany(initialBlogs)
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
    .set('Authorization', `Bearer ${token}`)
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
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  
  assert.strictEqual(response.body.likes, 0)
})

test ('blog creation fails with status code 400 if title and url are missing', async () => {
  const newBlog ={
    author: 'Test User',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

    const blogNoTitleUrl = {
      author: 'Test User',
      url: 'http://test.com',
      likes: 5
    }

    await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(blogNoTitleUrl)
    .expect(400)


    

})

test('a blog can be deleted', async () => {
  // 1. Get initial state
  const responseAtStart = await api.get('/api/blogs')
  const blogToDelete = responseAtStart.body[0]

  // 2. Perform the delete operation
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  // 3. Get state after deletion
  const responseAtEnd = await api.get('/api/blogs')
  
  // 4. Verify total length decreased by 1
  assert.strictEqual(responseAtEnd.body.length, responseAtStart.body.length - 1)

  // 5. Verify the specific blog is gone
  const titles = responseAtEnd.body.map(r => r.title)
  assert.ok(!titles.includes(blogToDelete.title))
})


test ('blog post can be updated', async () => {

  const responseAtStart = await api.get('/api/blogs')
  const blogToUpdate = responseAtStart.body[0]

  const updatedBlogData = {
    title: 'Updated Title',
    author: 'Updated Author',
    url: 'http://updatedurl.com',
    likes: 20
  }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlogData)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.title, updatedBlogData.title)
  assert.strictEqual(response.body.author, updatedBlogData.author)
  assert.strictEqual(response.body.url, updatedBlogData.url)
  assert.strictEqual(response.body.likes, updatedBlogData.likes)
})


test('fails with status code 401 if a user tries to delete a blog they did not create', async () => {
  const blogsAtStart = await Blog.find({})
  const blogToDestroy = blogsAtStart[0]

  const separateUserToken = await getAlternativeUserToken() 

  await api
    .delete(`/api/blogs/${blogToDestroy.id}`)
    .set('Authorization', `Bearer ${separateUserToken}`)
    .expect(401)

  const blogsAtEnd = await Blog.find({})
  expect(blogsAtEnd).toHaveLength(blogsAtStart.length) 
})