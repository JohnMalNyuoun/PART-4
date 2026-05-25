const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const path = require('path')

let mongoServer

const connectTestDb = async () => {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

  process.env.NODE_ENV = 'test'
  process.env.SECRET = process.env.SECRET || 'testsecret'

  if (!process.env.TEST_MONGODB_URI) {
    mongoServer = await MongoMemoryServer.create()
    process.env.TEST_MONGODB_URI = mongoServer.getUri()
  }

  await mongoose.connect(process.env.TEST_MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
  })
}

const closeTestDb = async () => {
  await mongoose.connection.close()

  if (mongoServer) {
    await mongoServer.stop()
  }
}

module.exports = {
  connectTestDb,
  closeTestDb
}
