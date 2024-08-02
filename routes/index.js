var express = require('express');
var router = express.Router();
const userModel = require('../model/user');
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const upload = require('./multer')
const postModel = require('../model/post');

router.get('/', (req, res) => {
  res.render('index', {nav: true});
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
    name: req.body.name,
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
  res.render('show', {user:user, nav: true, type: 'posts'});
});

router.get('/saved', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const user = await userModel.findOne({username: req.user.username});
  res.render('show', {user:user, nav: true, type: 'saved'});
});

router.get('/feed', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const posts = await postModel.find().populate('user');
  res.render('feed', {posts, nav: true});
});

router.get('/show/posts/:id', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const post = await postModel.findById(req.params.id).populate('user');
  // console.log(post);
  res.render('showpost', {post: post, nav: true});
})

router.get('/save/:id', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const user = await userModel.findOne({username: req.user.username});
  const post = await postModel.findById(req.params.id);
  user.boards.push(post.image);
  await user.save();
  res.redirect(`/show/posts/${req.params.id}`);
})

router.get('/follow/:id', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const user = await userModel.findOne({username: req.user.username});
  const userId = await userModel.findById(req.params.id);
  if (userId) {
    user.followers += 1;
    await user.save();
  }
  res.redirect(`/show/posts/${req.params.id}`);
})

router.get('/likes/:id', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const post = await postModel.findById(req.params.id);
  if (post) {
    post.likes += 1;
    await post.save();
  }
  res.redirect(`/show/posts/${req.params.id}`);
})

router.get('/unfollow/:id', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const user = await userModel.findOne({username: req.user.username});
  const userId = await userModel.findById(req.params.id);
  if (userId) {
    user.followers -= 1;
    await user.save();
  }
  res.redirect(`/show/posts/${req.params.id}`);
})

router.get('/unlike/:id', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const post = await postModel.findById(req.params.id);
  if (post) {
    post.likes -= 1;
    await post.save();
  }
  res.redirect(`/show/posts/${req.params.id}`);
})

router.get('/delete/:id', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const post = await postModel.findById(req.params.id);
  if (post) {
    await post.remove();
  }
  res.redirect('/profile');
})

router.get('/delete/saved/:id', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const user = await userModel.findOne({username: req.user.username});
  const post = await postModel.findById(req.params.id);
  if (post) {
    user.boards.pull(post.image);
    await user.save();
  }
  res.redirect('/saved');
})

router.get('/edit/:id', connectEnsureLogin.ensureLoggedIn(), async function (req, res, next) {
  const post = await postModel.findById(req.params.id);
  res.render('edit', {post: post, nav: true});
})

module.exports = router;
