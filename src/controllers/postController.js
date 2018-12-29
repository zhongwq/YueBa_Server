/**
 * Created by zhongwq on 2018/12/17.
 */
const { Post, User, Favourite } = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

/* const minute = 60 * 1000
const hour = 60 * minute
const day = 24 * hour */

function formatTime (time, fmt) {
  time = new Date(time)
  time = new Date(time.getTime() + (new Date().getTimezoneOffset()) * 60 * 1000)
  var o = {
    'M+': time.getMonth() + 1, // 月份
    'd+': time.getDate(), // 日
    'h+': time.getHours(), // 小时
    'm+': time.getMinutes(), // 分
    's+': time.getSeconds() // 秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

module.exports = {
  async getAllPosts (req, res) {
    try {
      var posts = await Post.findAll({
        include: [{ model: User, as: 'author', attributes: ['id', 'username', 'email', 'phone', 'img'] }]
      }).map(async (post) => {
        var favouriteUser = await Favourite.findAll({
          where: {
            PostId: post.id
          }
        }).map(async (favourite) => {
          var user = await User.findOne({
            where: {
              id: favourite.UserId
            },
            attributes: ['id', 'username', 'email', 'phone', 'img']
          })
          return user
        })
        post = post.toJSON()
        post.createdAt = formatTime(post.createdAt, 'yyyy-MM-dd hh:mm')
        post.favourite = favouriteUser
        if (post.img !== '') {
          post.img = post.img.split(',')
        } else {
          post.img = []
        }
        return post
      })
      res.send({
        posts: posts
      })
    } catch (err) {
      console.log(err)
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
      if (req.files) {
        for (var file of req.files) {
          imgArr.push(file.path)
        }
      }
      var post = await Post.create({
        content: req.body.content,
        authorId: result.id,
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
      console.log(err)
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
          id: req.params.id,
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
        error: 'Error when delete post'
      })
    }
  }
}
