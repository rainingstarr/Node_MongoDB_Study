const e = require('express');
const express = require('express'); //express import 해주세요
const app = express(); // express 객체를 app 변수에 담아주세요
app.use(express.urlencoded({extended: true})); //bodyParser 이용
const MongoClient = require('mongodb').MongoClient;
app.set('view engine','ejs');

app.use('/public',express.static('public'));//public 내부파일 서버에서 사용하겠다는 뜻

var db;
MongoClient.connect('mongodb+srv://admin:dl147258@rainingstar.lv4chwl.mongodb.net/?retryWrites=true&w=majority', function(error, client){
    if (error) return console.log(error);
    //서버띄우는 코드 여기로 옮기기
    db= client.db('todoapp');
    app.listen('8080', function(){
        console.log('listening on 8080')        
    });
})


app.get('/',function(res,req){
    req.sendFile(__dirname + '/index.html');
});
app.get('/write',function(res,req){
    req.sendFile(__dirname + '/write.html');
});


app.post('/add',function(res,req){
    req.send('전송완료');
    db.collection('counter').findOne({name : '게시물갯수'}, function(error,result){
        console.log(result.totalPost);
        var 총게시물갯수 = result.totalPost;
        db.collection('post').insertOne({ _id : 총게시물갯수 + 1, 제목 : res.body.title, 날짜 : res.body.date},function(error,result){
            if (error){return console.log(error)};
            db.collection('counter').updateOne({name : '게시물갯수'},{$inc : {totalPost : 1}},function(error,result){
                // 성공시~ 해줘요~ 
                if(error){return console.log(error)}
            });//update 는 operator 라는 연산자를 사용해야함
        });
    });
});


app.get('/list',function(res,req){
    db.collection('post').find().toArray(function(error,result){
        console.log(result);
        req.render('list.ejs',{posts : result});
    });
});


app.delete('/delete',function(res,req){
    res.body._id = parseInt(res.body._id);
    console.log(res.body);
    db.collection('post').deleteOne(res.body,function(error,result){
        console.log('삭제완료');
        req.status(200).send({ message : '성공했습니다'});//응답코드
    });
});


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave: true,saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login',function(res,req){
    req.render('login.ejs');
})
app.post('/login',passport.authenticate('local',{
    failureRedirect : '/fail'
}),function(res,req){
    req.redirect('/')
})

passport.use(new LocalStrategy({
    usernameField: 'id',//form name 이 id 인것은 username
    passwordField: 'pw',//form name 이 pw 인것은 password
    session: true,//로그인후 세션저장
    passReqToCallback: false,//아이디 비번 말고도 다른 정보 검증시
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));