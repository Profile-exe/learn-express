const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const io = require('../socket');
const { Post } = require('../models/post');
const { User } = require('../models/user');

module.exports = {
  async getPosts(req, res, next) {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
      const totalItems = await Post.find().countDocuments();

      const posts = await Post.find()
        .populate('creator')
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage);

      res.status(200).json({
        message: 'Fetched posts successfully.',
        posts,
        totalItems,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },

  async createPost(req, res, next) {
    // Validate title and content
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      error.data = errors.array();
      return next(error); // return next() to exit the function
    }

    const { title, content } = req.body;

    if (!req.file) {
      const error = new Error('No image provided.');
      error.statusCode = 422;
      return next(error);
    }

    const filename = path.basename(req.file.path);
    const imageUrl = `images/${filename}`;

    try {
      const post = new Post({
        title,
        content,
        imageUrl,
        creator: req.userId,
      });

      await post.save();

      const creator = await User.findById(req.userId);
      creator.posts.push(post);

      await creator.save();

      io.getIO().emit('posts', {
        action: 'create',
        post: {
          ...post._doc,
          creator: { _id: req.userId, name: creator.name },
        },
      });

      // Create post in db
      res.status(201).json({
        message: 'Post created successfully!',
        post,
        creator: { _id: creator._id, name: creator.name },
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    }
  },

  async getPost(req, res, next) {
    const { postId } = req.params;

    try {
      const post = await Post.findById(postId);

      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        return next(error);
      }

      res.status(200).json({ message: 'Post fetched.', post });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },

  async updatePost(req, res, next) {
    // Validate title and content
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      error.data = errors.array();
      return next(error); // return next() to exit the function
    }

    const { postId } = req.params;
    const { title, content } = req.body;

    try {
      const post = await Post.findById(postId).populate('creator');

      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        return next(error);
      }

      if (post.creator._id.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        return next(error);
      }

      const imagePath = path.basename(
        (req.file ? req.file.path : req.body.image) || post.imageUrl
      );
      const imageUrl = `images/${imagePath}`;

      post.title = title;
      post.content = content;
      if (imageUrl && imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
        post.imageUrl = imageUrl;
      }

      const result = await post.save();

      io.getIO().emit('posts', { action: 'update', post: result });

      res.status(200).json({ message: 'Post updated!', post });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    }
  },

  async deletePost(req, res, next) {
    const { postId } = req.params;

    try {
      const post = await Post.findById(postId);

      if (!post) {
        const notFoundError = new Error('Could not find post.');
        notFoundError.statusCode = 404;
        return next(notFoundError);
      }

      if (post.creator.toString() !== req.userId) {
        const unauthorizedError = new Error('Not authorized!');
        unauthorizedError.statusCode = 403;
        return next(unauthorizedError);
      }

      // Delete deletedPost image
      clearImage(post.imageUrl);

      await Post.findByIdAndDelete(postId);

      // Delete post from user's posts
      const user = await User.findById(req.userId);
      user.posts.pull(postId);
      await user.save();

      io.getIO().emit('posts', { action: 'delete', post: postId });

      res.status(200).json({ message: 'Deleted post.' });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    }
  },
};

const clearImage = (filePath) => {
  const fileDist = path.join(__dirname, '..', filePath);
  fs.unlink(fileDist, (err) => {
    if (err) console.log(err);
  });
};
