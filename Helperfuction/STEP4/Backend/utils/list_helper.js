const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) { return null }

  return blogs.reduce((favorite, blog) => {
    return (favorite.likes > blog.likes) ? favorite : blog
  })
}
const _ = require('lodash')

const mostBlogs = (blogs) => {
  if (blogs.length === 0) { return null }

  const grouped = _.groupBy(blogs, 'author')

  const authorCounts = _.map(grouped, (blogByAuthor, authorName) => ({
    author: authorName,
    blogs: blogByAuthor.length
  }))
  return _.maxBy(authorCounts, 'blogs')                       
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}
