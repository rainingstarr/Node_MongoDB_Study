const express = require('express'); //express import 해주세요
const app = express(); // express 객체를 app 변수에 담아주세요
app.use(express.urlencoded({extended: true})); //bodyParser 이용
const MongoClient = require('mongodb').MongoClient;

var db;
MongoClient.connect('mongodb+srv://admin:dl147258@rainingstar.lv4chwl.mongodb.net/?retryWrites=true&w=majority', function(error, client){
    if (error) return console.log(error);
    //서버띄우는 코드 여기로 옮기기

    db= client.db('todoapp');
    app.listen('8080', function(){
        console.log('listening on 8080')
    });
})



app.get('/pet',function(res,req){
    req.send('펫용품 쇼핑할 수 있는 페이지입니다.');
});

app.get('/beauty',function(res,req){
    req.send('뷰팅용품 쇼핑할 수 있는 페이지입니다.');
});

app.get('/',function(res,req){
    req.sendFile(__dirname + '/index.html');
});

app.get('/write',function(res,req){
    req.sendFile(__dirname + '/write.html');
});

app.post('/add',function(res,req){
    req.send('전송완료');
    console.log(res.body);
});
