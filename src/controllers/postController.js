/**
 * Created by zhongwq on 2018/12/17.
 */
const { formatTime } = require('../utils/timeUtils')
const { Post, User, Favourite, Comment } = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

module.exports = {
  async getAllPosts (req, res) {
    try {
      var posts = await Post.findAll({
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'author', attributes: ['id', 'username', 'email', 'phone', 'img'] }]
      }).map(async (post) => {
        var comments = await Comment.findAll({
          where: {
            postId: post.id
          },
          include: [{ model: User, as: 'author', attributes: ['id', 'username', 'email', 'phone', 'img'] }, { model: User, as: 'replyTo', attributes: ['id', 'username', 'email', 'phone', 'img'] }]
        })
        for (var i = 0; i < comments.length; i++) {
          comments[i] = comments[i].toJSON()
          comments[i].createdAt = formatTime(comments[i].createdAt, 'yyyy-MM-dd hh:mm')
        }
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
        post.comments = comments
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
  async getAllUserPosts (req, res) {
    try {
      var posts = await Post.findAll({
        where: {
          authorId: req.params.id
        },
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'author', attributes: ['id', 'username', 'email', 'phone', 'img'] }]
      }).map(async (post) => {
        var comments = await Comment.findAll({
          where: {
            postId: post.id
          },
          include: [{ model: User, as: 'author', attributes: ['id', 'username', 'email', 'phone', 'img'] }, { model: User, as: 'replyTo', attributes: ['id', 'username', 'email', 'phone', 'img'] }]
        })
        for (var i = 0; i < comments.length; i++) {
          comments[i] = comments[i].toJSON()
          comments[i].createdAt = formatTime(comments[i].createdAt, 'yyyy-MM-dd hh:mm')
        }
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
        post.comments = comments
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
      var result = null
      try {
        result = jwt.verify(token, config.authServiceToken.secretKey)
        if (!result) {
          return res.status(400).send({
            error: 'The token is not valid! Please sign in and try again!'
          })
        }
      } catch (err) {
        return res.status(400).send({
          error: 'Token expired, please login again!'
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
      post = post.toJSON()
      post.comments = []
      post.favourite = []
      post.createdAt = formatTime(post.createdAt, 'yyyy-MM-dd hh:mm')
      res.send({
        post: post
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
      if (!token) {
        return res.status(400).send({
          error: 'token should be given!'
        })
      }
      var result = null
      try {
        result = jwt.verify(token, config.authServiceToken.secretKey)
        if (!result) {
          return res.status(400).send({
            error: 'The token is not valid! Please sign in and try again!'
          })
        }
      } catch (err) {
        return res.status(400).send({
          error: 'Token expired, please login again!'
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
      if (!token) {
        return res.status(400).send({
          error: 'token should be given!'
        })
      }
      var result = null
      try {
        result = jwt.verify(token, config.authServiceToken.secretKey)
        if (!result) {
          return res.status(400).send({
            error: 'The token is not valid! Please sign in and try again!'
          })
        }
      } catch (err) {
        return res.status(400).send({
          error: 'Token expired, please login again!'
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
      if (!token) {
        return res.status(400).send({
          error: 'token should be given!'
        })
      }
      var result = null
      try {
        result = jwt.verify(token, config.authServiceToken.secretKey)
        if (!result) {
          return res.status(400).send({
            error: 'The token is not valid! Please sign in and try again!'
          })
        }
      } catch (err) {
        return res.status(400).send({
          error: 'Token expired, please login again!'
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
  },
  async addComment (req, res) {
    try {
      const token = req.header('Authorization')
      if (!token) {
        return res.status(400).send({
          error: 'token should be given!'
        })
      }
      var result = null
      try {
        result = jwt.verify(token, config.authServiceToken.secretKey)
        if (!result) {
          return res.status(400).send({
            error: 'The token is not valid! Please sign in and try again!'
          })
        }
      } catch (err) {
        return res.status(400).send({
          error: 'Token expired, please login again!'
        })
      }

      var comment = await Comment.create({
        content: req.body.content,
        authorId: result.id,
        replyToId: req.body.replyto,
        postId: req.params.id
      })
      comment = comment.toJSON()
      comment.createdAt = formatTime(comment.createdAt, 'yyyy-MM-dd hh:mm')
      res.send({
        comment: comment
      })
    } catch (err) {
      console.log(err)
      res.status(400).send({
        error: 'Error when add comment'
      })
    }
  },
  async getComments (req, res) {
    try {
      var comments = await Comment.findAll({
        where: {
          postId: req.params.id
        },
        include: [{ model: User, as: 'author', attributes: ['id', 'username', 'email', 'phone', 'img'] }, { model: User, as: 'replyTo', attributes: ['id', 'username', 'email', 'phone', 'img'] }]
      })
      for (var i = 0; i < comments.length; i++) {
        comments[i] = comments[i].toJSON()
        comments[i].createdAt = formatTime(comments[i].createdAt, 'yyyy-MM-dd hh:mm')
      }
      res.send({
        comments: comments
      })
    } catch (err) {
      res.status(400).send({
        error: 'Error when getting comment'
      })
    }
  },
  async deleteComment (req, res) {
    try {
      const token = req.header('Authorization')
      if (!token) {
        return res.status(400).send({
          error: 'token should be given!'
        })
      }
      var result = null
      try {
        result = jwt.verify(token, config.authServiceToken.secretKey)
        if (!result) {
          return res.status(400).send({
            error: 'The token is not valid! Please sign in and try again!'
          })
        }
      } catch (err) {
        return res.status(400).send({
          error: 'Token expired, please login again!'
        })
      }

      var comment = await Comment.findOne({
        where: {
          id: req.params.commentId,
          authorId: result.id
        }
      })
      if (!comment) {
        res.status(400).send({
          error: 'No post is found, please check your request!'
        })
      }
      await comment.destroy()
      res.send({
        info: 'Delete comment successfully'
      })
    } catch (err) {
      res.status(400).send({
        error: 'Error when delete comment'
      })
    }
  }
}
