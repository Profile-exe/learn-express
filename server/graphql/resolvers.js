const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const { User } = require('../models/user');
const { Post } = require('../models/post');
const { clearImage } = require('../util/file');

module.exports = {
  createUser: async ({ userInput }, req) => {
    const { email, name, password } = userInput;

    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: 'E-Mail is invalid.' });
    }

    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({ message: 'Password too short!' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors; // error.data에 서버에서 정의한 에러를 담아서 클라이언트로 전달
      throw error;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error('User exists already!');
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      name,
      password: hashedPassword,
    });

    const createdUser = await user.save();

    //  GraphQL에서 _id 타입은 String이므로 toString()을 사용하여 변환
    // _id 타입이 ObjectId일 경우, GraphQL에서는 String으로 변환되지 않음
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  login: async ({ loginInput }, req) => {
    const { email, password } = loginInput;

    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error('User not found.');
      error.code = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error('Password is incorrect.');
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return { token, userId: user._id.toString() };
  },

  signup: async ({ userInput }, req) => {
    const { email, name, password } = userInput;

    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: 'E-Mail is invalid.' });
    }

    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({ message: 'Password too short!' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors; // error.data에 서버에서 정의한 에러를 담아서 클라이언트로 전달
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      name,
      password: hashedPassword,
    });

    const createdUser = await user.save();
    const token = jwt.sign(
      {
        userId: createdUser._id.toString(),
        email: createdUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return { token, userId: createdUser._id.toString() };
  },

  createPost: async ({ postInput }, req) => {
    if (!req.isAuth) {
      const error = new Error('Not authenticated!');
      error.code = 401;
      throw error;
    }

    const { title, content, imageUrl } = postInput;
    const errors = [];

    const image = `images/${path.basename(imageUrl)}`;

    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: 'Title is invalid.' });
    }

    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: 'Content is invalid.' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('Invalid user.');
      error.code = 401;
      throw error;
    }

    const post = new Post({
      title,
      content,
      imageUrl: image,
      creator: user,
    });

    const createdPost = await post.save();

    // Add post to user's posts
    user.posts.push(createdPost);
    await user.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },

  posts: async ({ page }, req) => {
    if (!req.isAuth) {
      const error = new Error('Not authenticated!');
      error.code = 401;
      throw error;
    }

    if (!page) {
      page = 1;
    }

    const perPage = 2;
    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate('creator')
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    return {
      posts: posts.map((post) => {
        // GraphQL에서 _id와 createdAt, updatedAt 타입은
        // 지원되지 않기 때문에 toString()과 toISOString()을 사용하여 변환
        return {
          ...post._doc,
          _id: post._id.toString(),
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        };
      }),
      totalPosts,
    };
  },

  post: async ({ id }, req) => {
    if (!req.isAuth) {
      const error = new Error('Not authenticated!');
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(id).populate('creator');

    if (!post) {
      const error = new Error('No post found!');
      error.code = 404;
      throw error;
    }

    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },

  updatePost: async ({ id, postInput }, req) => {
    if (!req.isAuth) {
      const error = new Error('Not authenticated!');
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(id).populate('creator');

    if (!post) {
      const error = new Error('No post found!');
      error.code = 404;
      throw error;
    }

    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized!');
      error.code = 403;
      throw error;
    }

    const { title, content, imageUrl } = postInput;
    const errors = [];
    const image = `images/${path.basename(imageUrl)}`;

    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: 'Title is invalid.' });
    }

    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: 'Content is invalid.' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      throw error;
    }

    post.title = title;
    post.content = content;
    if (imageUrl !== 'undefined') {
      post.imageUrl = image;
    }

    const updatedPost = await post.save();

    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },

  deletePost: async ({ id }, req) => {
    if (!req.isAuth) {
      const error = new Error('Not authenticated!');
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(id);

    if (!post) {
      const error = new Error('No post found!');
      error.code = 404;
      throw error;
    }

    // populate를 안한 상태에서는 creator가 ObejctId로 반환되므로 toString()을 사용하여 변환
    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized!');
      error.code = 403;
      throw error;
    }

    clearImage(post.imageUrl);

    const deletedPost = await Post.findByIdAndRemove(id);

    // Remove post from user's posts
    const user = await User.findById(req.userId);
    user.posts.pull(id);
    await user.save();

    return {
      ...deletedPost._doc,
      _id: deletedPost._id.toString(),
      createdAt: deletedPost.createdAt.toISOString(),
      updatedAt: deletedPost.updatedAt.toISOString(),
    };
  },

  user: async (args, req) => {
    if (!req.isAuth) {
      const error = new Error('Not authenticated!');
      error.code = 401;
      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('No user found!');
      error.code = 404;
      throw error;
    }

    return {
      ...user._doc,
      _id: user._id.toString(),
    };
  },

  updateStatus: async ({ status }, req) => {
    if (!req.isAuth) {
      const error = new Error('Not authenticated!');
      error.code = 401;
      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('No user found!');
      error.code = 404;
      throw error;
    }

    user.status = status;
    await user.save();

    return {
      ...user._doc,
      _id: user._id.toString(),
    };
  },
};
