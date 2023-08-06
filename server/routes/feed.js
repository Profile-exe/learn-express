const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed');

const router = express.Router();

router.get('/posts', feedController.getPosts);

router.post(
  '/post',
  [
    // validate title and content
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router
  .route('/post/:postId')
  .get(feedController.getPost)
  .put(
    [
      // validate title and content
      body('title').trim().isLength({ min: 5 }),
      body('content').trim().isLength({ min: 5 }),
    ],
    feedController.updatePost
  )
  .delete(feedController.deletePost);

module.exports = router;
