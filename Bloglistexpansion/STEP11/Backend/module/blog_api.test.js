const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { connectTestDb, closeTestDb } = require('./test_setup')

jest.setTimeout(600000)

const initialBlogs = [
  {
    title: 'First Blog',
    author: 'Author One',
    url: 'http://first.com',
    likes: 1
  },
  {
    title: 'Second Blog',
    author: 'Author Two',
    url: 'http://second.com',
    likes: 2
  }
]

const createUserAndGetToken = async (username = 'testuser') => {
  const newUser = {
    username,
    name: 'Test User',
    password: 'testpass'
  }

  await api.post('/api/users').send(newUser)

  const loginResponse = await api
    .post('/api/login')
    .send({ username: newUser.username, password: newUser.password })

  const user = await User.findOne({ username: newUser.username })

  return {
    token: loginResponse.body.token,
    userId: user._id
  }
}

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const { userId } = await createUserAndGetToken()
  const blogsWithUser = initialBlogs.map((blog) => ({ ...blog, user: userId }))
  await Blog.insertMany(blogsWithUser)
})

beforeAll(async () => {
  await connectTestDb()
})

afterAll(async () => {
  await closeTestDb()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blog posts have unique identifier named id', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body[0].id).toBeDefined()
  expect(response.body[0]._id).toBeUndefined()
})

test('a valid blog can be added', async () => {
  const { token } = await createUserAndGetToken('writer')

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
  expect(response.body).toHaveLength(initialBlogs.length + 1)

  const titles = response.body.map(r => r.title)
  expect(titles).toContain('Testing with Supertest')
})

test('blog defaults to zero likes if property is missing', async () => {
  const { token } = await createUserAndGetToken('nolikes')

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

  expect(response.body.likes).toBe(0)
})

test('blog creation fails with status code 400 if title and url are missing', async () => {
  const { token } = await createUserAndGetToken('invalidblog')

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send({ author: 'Test User', likes: 5 })
    .expect(400)
})

test('a blog can be deleted', async () => {
  const { token } = await createUserAndGetToken('deleter')

  const createdBlog = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Delete me',
      author: 'Delete Author',
      url: 'http://delete.com',
      likes: 1
    })
    .expect(201)

  const responseAtStart = await api.get('/api/blogs')

  await api
    .delete(`/api/blogs/${createdBlog.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const responseAtEnd = await api.get('/api/blogs')
  expect(responseAtEnd.body).toHaveLength(responseAtStart.body.length - 1)

  const titles = responseAtEnd.body.map(r => r.title)
  expect(titles).not.toContain('Delete me')
})

test('blog post can be updated', async () => {
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

  expect(response.body.title).toBe(updatedBlogData.title)
  expect(response.body.author).toBe(updatedBlogData.author)
  expect(response.body.url).toBe(updatedBlogData.url)
  expect(response.body.likes).toBe(updatedBlogData.likes)
})

test('fails with status code 401 if a user tries to delete a blog they did not create', async () => {
  const owner = await createUserAndGetToken('owner')
  const attacker = await createUserAndGetToken('attacker')

  const createdBlog = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${owner.token}`)
    .send({
      title: 'Protected Blog',
      author: 'Owner',
      url: 'http://protected.com',
      likes: 3
    })
    .expect(201)

  await api
    .delete(`/api/blogs/${createdBlog.body.id}`)
    .set('Authorization', `Bearer ${attacker.token}`)
    .expect(401)

  const blogsAtEnd = await Blog.find({})
  expect(blogsAtEnd).toHaveLength(1)
})
