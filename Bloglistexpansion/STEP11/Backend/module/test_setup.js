const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const path = require('path')

let mongoServer

const connectTestDb = async () => {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

  process.env.NODE_ENV = 'test'
  process.env.SECRET = process.env.SECRET || 'testsecret'

  const useExternalTestDb = process.env.USE_EXTERNAL_TEST_DB === 'true'
  if (!useExternalTestDb) {
    mongoServer = await MongoMemoryServer.create({
      binary: { version: '7.0.14' }
    })
    process.env.TEST_MONGODB_URI = mongoServer.getUri()
  } else if (!process.env.TEST_MONGODB_URI) {
    throw new Error('TEST_MONGODB_URI is required when USE_EXTERNAL_TEST_DB=true')
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
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
