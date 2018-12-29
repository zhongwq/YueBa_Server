/**
 * Created by zhongwq on 2018/12/17.
 */
const { Post, User, Favourite } = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

module.exports = {
  async getAllPosts (req, res) {
    try {
      var posts = await Post.findAll({
        include: [{ model: User, as: 'author', attributes: ['id', 'username', 'email', 'phone', 'img'] }]
      })
      for (var post of posts) {
        if (post.img !== '') {
          post.img = post.img.split(',')
        } else {
          post.img = []
        }
      }
      res.send({
        posts: posts
      })
    } catch (err) {
      res.status(400).send({
        error: 'Some wrong occoured when getting data!'
      })
    }
  },
  async addPost (req, res) {
    try {
      const token = req.header('Authorization')
      if (!token) {
        return res.status(400).send({
          error: 'token should be given!'
        })
      }
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      var imgArr = []
      for (var file of req.files) {
        imgArr.push(file.path)
      }
      var post = await Post.create({
        content: req.body.content,
        authorId: 1,
        img: imgArr.join(',')
      })
      if (post.img !== '') {
        post.img = post.img.split(',')
      } else {
        post.img = []
      }
      res.send({
        post: post.toJSON()
      })
    } catch (err) {
      res.status(400).send({
        error: 'Add post failed, please check ' + err.errors[0].path
      })
    }
  },
  async favouritePost (req, res) {
    try {
      const token = req.header('Authorization')
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      await Favourite.create({
        UserId: result.id,
        PostId: req.body.id
      })
      res.send({
        info: 'Favourite success!'
      })
    } catch (err) {
      res.status(400).send({
        error: 'Error when favourite post'
      })
    }
  },
  async unfavouritePost (req, res) {
    try {
      const token = req.header('Authorization')
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      var favourite = await Favourite.findOne({
        where: {
          UserId: result.id,
          PostId: req.body.id
        }
      })
      await favourite.destroy()
      res.send({
        info: 'Unfavourite post successfully!'
      })
    } catch (err) {
      res.status(400).send({
        error: 'Error when favourite post'
      })
    }
  },
  async deletePost (req, res) {
    try {
      const token = req.header('Authorization')
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }

      var post = await Post.findOne({
        where: {
          id: req.body.id,
          authorId: result.id
        }
      })
      if (!post) {
        res.status(400).send({
          error: 'No post is found, please check your request!'
        })
      }
      await post.destroy()
      res.send({
        info: 'Delete post successfully'
      })
    } catch (err) {
      res.status(400).send({
        error: 'Error when add post'
      })
    }
  }
}
