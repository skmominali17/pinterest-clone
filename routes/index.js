var express = require('express');
var router = express.Router();
const userModel = require('../model/user');
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const upload = require('./multer')
const postModel = require('../model/post');

router.get('/', (req, res) => {
  res.render('index', {nav: false});
})

router.get('/login', function (req, res, next) {
  res.render('login', {nav: false});
});

router.get('/profile', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.user.username }).populate('posts');
  res.render('profile', {user: user, nav: true});
})

router.post('/login', passport.authenticate('local', { failureRedirect: '/' }),  function(req, res) {
	res.redirect('/profile');
});

router.get('/register', function (req, res, next) {
  res.render('register', {nav: false});
});

router.post('/register', function (req, res, next) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact
  });

  userModel.register(data, req.body.password).then(()=> {
    res.redirect('/login');
  });
});


router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


router.post('/fileupload', connectEnsureLogin.ensureLoggedIn(), upload.single("image"), async function (req, res, next) {
  const user = await userModel.findOne({username: req.user.username})
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

router.get('/add', connectEnsureLogin.ensureLoggedIn(), function (req, res, next) {
  res.render('add', {nav: true});
});

router.post('/createpost', connectEnsureLogin.ensureLoggedIn(), upload.single("postimage"), async function (req, res, next) {
  const user = await userModel.findOne({username: req.user.username});
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  })

  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});

router.get('/show/posts', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const user = await userModel.findOne({username: req.user.username}).populate('posts');
  res.render('show', {user:user, nav: true});
});

router.get('/feed', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const posts = await postModel.find().populate('user');
  res.render('feed', {posts, nav: true});
});

module.exports = router;
