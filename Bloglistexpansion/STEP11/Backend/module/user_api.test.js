const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const { connectTestDb, closeTestDb } = require('./test_setup')

jest.setTimeout(600000)

beforeAll(async () => {
  await connectTestDb()
})

afterAll(async () => {
  await closeTestDb()
})

beforeEach(async () => {
  await User.deleteMany({})
})

describe('creating a new user', () => {
  test('fails with status code 400 if username is less than 3 characters', async () => {
    const newUser = {
      username: 'ab',
      name: 'Test User',
      password: 'password123'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('Username must be at least 3 characters long')
  })

  test('fails with status code 400 if username is not unique', async () => {
    // Ensure the DB has one user already
    const existingUser = new User({ username: 'root', passwordHash: '...' })
    await existingUser.save()

    const newUser = {
      username: 'root',
      name: 'Duplicate',
      password: 'password123'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('Username must be unique')
  })
})