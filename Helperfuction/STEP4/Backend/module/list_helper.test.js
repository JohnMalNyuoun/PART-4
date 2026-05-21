const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Kasereka',
    url: 'https://reactpatterns.com/',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'John',
    url: 'https://reactpatterns.com/',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Bruno Fernandez',
    url: 'https://reactpatterns.com/',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Simba',
    url: 'https://reactpatterns.com/',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Mal',
    url: 'https://reactpatterns.com/',
    likes: 2,
    __v: 0
  }
]

describe('dummy', () => {
  test('dummy returns one', () => {
    const result = listHelper.dummy([])
    assert.strictEqual(result, 1)
  })
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    // Slicing out just the Dijkstra blog (5 likes)
    const listWithOneBlog = [blogs[1]]
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('of a bigger list is calculated right', () => {
    // 7 + 5 + 12 + 10 + 0 + 2 = 36
    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 36)
  })
})

describe ('favorite blog', () => {

  test ('of list with one blog is the blog itself', () => {
    const result = listHelper.favoriteBlog([blogs[1]])  
    assert.deepStrictEqual(result, blogs[1])
  })

  test ('of a bigger list is the blog with most likes', () => {
    const result = listHelper.favoriteBlog(blogs)
    assert.deepStrictEqual(result, blogs[2])
  })

  test ('of empty list is null', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, null)
  })


})


describe ('most blogs', () => {

  test ('of  a biggest list is calcuated correctly', () => {
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, { author: 'Michael', blogs: 1 })

  })  
  test ('of empty list is null', () => {
  
    assert.strictEqual(listHelper.mostBlogs([]), null)
  })
})
