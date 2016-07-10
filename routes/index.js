// express
var express = require('express');
var router = express.Router();
// mongoose & models
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

// middleware function
// execute callback when 'post' in request
router.param('post', function(req, res, next, id) {
  console.log('LOGGER post middleware');
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

// middleware function
// execute callback when 'comment' in request
router.param('comment', function(req, res, next, id) {
  console.log('LOGGER comment middleware');
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error('can\'t find comment')); }

    req.comment = comment;
    return next();
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('LOGGER get home page');
  res.render('index', { title: 'Express' });
});

// GET all posts
router.get('/posts', function(req, res, next) {
  console.log('LOGGER get posts');
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

// GET single Post
router.get('/posts/:post', function(req, res) {
  console.log('LOGGER get single');
  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

// POST create new Post
router.post('/posts', function(req, res, next) {
  console.log('LOGGER create post');
  var post = new Post(req.body);

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

// PUT upvote post
router.put('/posts/:post/upvote', function(req, res, next) {
  console.log('LOGGER upvote post');
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});

// POST create comment and attach to post
router.post('/posts/:post/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

// PUT upvote comment
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
  console.log('LOGGER upvote comment');
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});

module.exports = router;
