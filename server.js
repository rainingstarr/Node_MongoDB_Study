const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
require('dotenv').config();


const app = express();

app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

var db;

const MongoClient = require('mongodb').MongoClient;

MongoClient.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(error, client) {
  if (error) return console.log(error);
  db = client.db('todoapp');
  app.listen(process.env.PORT, function() {
    console.log('listening on 8080');
  });
});

app.use('/',require('./routes/shop.js'));
app.use('/board/sub',require('./routes/board.js'));

app.post('/add', function(req, res) {
  res.send('전송완료');
  db.collection('counter').findOne({name: '게시물갯수'}, function(error, result) {
    console.log(result.totalPost);
    var 총게시물갯수 = result.totalPost;
    db.collection('post').insertOne({ _id: 총게시물갯수 + 1, 제목: req.body.title, 날짜: req.body.date }, function(error, result) {
      if (error) {
        return console.log(error);
      }
      db.collection('counter').updateOne({name: '게시물갯수'}, {$inc: {totalPost: 1}}, function(error, result) {
        if (error) {
          return console.log(error);
        }
      });
    });
  });
});

app.get('/list', function(req, res) {
  db.collection('post').find().toArray(function(error, result) {
    console.log(result);
    res.render('list.ejs', {posts: result});
  });
});

app.delete('/delete', function(req, res) {
  req.body._id = parseInt(req.body._id);
  console.log(req.body);
  db.collection('post').deleteOne(req.body, function(error, result) {
    console.log('삭제완료');
    res.status(200).send({ message: '성공했습니다'});
  });
});

app.get('/login', function(req, res) {
  res.render('login.ejs');
});
app.use(session({
    secret: '비밀코드',
    resave: true,
    saveUninitialized: false,
  }));
app.use(passport.initialize());
app.use(passport.session());

app.post('/login', passport.authenticate('local', {failureRedirect: '/fail'}), function(req, res) {
  res.redirect('/');
});

app.get('/mypage',로그인했니,function(req,res){
    console.log(req.user);
    res.render('mypage.ejs',{사용자 : req.user});
});

function 로그인했니(req,res,next){
    if (req.user){
        next()
    }else{
        res.send('로그인안하셧는데요?')
    }
}

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  db.collection('login').findOne({id: 입력한아이디}, function (에러, 결과) {
    if (에러) return done(에러);
    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' });
    if (입력한비번 == 결과.pw) {
      return done(null, 결과);
    } else {
      return done(null, false, { message: '비번틀렸어요' });
    }
  });
}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function (아이디, done) {
    db.collection('login').findOne({id: 아이디}, function (에러, 결과) {
        done(null, 결과);
    });
});

