var express = require('express');
var path = require('path');
const expressSession = require('express-session');
const passport = require('passport');

var indexRouter = require('./routes/index');
const user = require('./model/user');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use(expressSession({
  resave: false,
  saveUninitialized: true,
  secret: 'keyboard cat'
}))
app.use(passport.initialize());
app.use(passport.session());

passport.use(user.createStrategy());

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);


app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
