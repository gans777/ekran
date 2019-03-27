var express=require('express');
var app=express();
app.set('view engine', 'ejs');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser=require('body-parser');// эксперимент, может и не надо это
//const clientSessions = require("client-sessions");
GLOBAL._ = require('underscore');
app.use(bodyParser());// эксперимент
app.use(cookieParser());
app.use(session({
    secret: '34SDgsdgspxxxxxdfsG', // just a long random string
    resave: true,                     //была false
    saveUninitialized: false,   //  если true, то сессия одна и таже--не меняется при перезагрузке

}));

var server=require('http').createServer(app);
var io=require('socket.io').listen(server);
const fs = require("fs");
//var mysql=require('mysql');

server.listen(3000);

app.get('/', function(request,respons){
    //request.session.message = 'Hello World___ghbdtn';
   // console.log(request.session.message);
    //console.log(request.session.id);

	respons.sendFile(__dirname + '/index.html');
});

app.get('/news', function(req, res){
    res.render('news', { //newsId: req.params.id,
                       sessionId: req.session.id
    });
});

var session_=0;

app.get('/js',function (request,respons) {

      var header= "";
    //respons.send(' ');
    //respons.send('Вы запросили профиль с идентификатором: ' + request.params.id);
    //request.session.message = 'Hello World___js';
   // console.log(request.session.message);
    console.log('session from app.get js id='+request.session.id);
    //var socket = io.connect();
     var html=request.session.id;
   // socket.emit('session_on',request.session.id);
    respons.send(html);
});

GLOBAL._sess=0;
app.get('/glob',function (request,respons) {   // здесь генерятся сессии

    GLOBAL._sess=request.session.id;
    var html=request.session.id;
    // socket.emit('session_on',request.session.id);
    respons.send(html);
})
/*
app.get('/js1/:id',function (request,respons) {

    session_=request.session.id;
    respons.send('Вы запросили профиль с идентификатором: ' + request.params.id);
    request.session.message = 'Hello World___js';
    console.log(request.session.message);
    console.log('session id='+request.session.id);
    //respons.send('');
})
*/
app.get('/read', function(request,respons){

	respons.sendFile(__dirname + '/read.html');
});
/////
app.get('/item', function(req, res) {  // эксперимент!!!!!

});
//////

var count=0;
// Массив со всеми подключениями
var connections = [];
console.log(' сервер node.js включен')
// Функция, которая сработает при подключении к странице
// Считается как новый пользователь

io.sockets.on('connection', function(socket) {
	count++;
	//socket_id[0]=count;
	console.log("Успешное соединение"+count);
    socket["id_socket"]=count;
	//console.log(socket[socket_id]);
	// Добавление нового соединения в массив
    //console.log('ID сессии: '+socket.session.ID);
	connections.push(socket);
      console.log('session='+ session_);

	console.log(socket["id_socket"]);

     socket.emit('my_socket', socket["id_socket"]);
     socket.on('session_on', function (data) {
        console.log("my id from socket="+ data);
     });

	// Функция, которая срабатывает при отключении от сервера
	socket.on('disconnect', function(data) {
		// Удаления пользователя из массива
		console.log('отключилось соединение'+socket["id_socket"]);
		connections.splice(connections.indexOf(socket), 1);
		console.log("Отключились");
	});

	///// считывание с формы и из read.php
  socket.on('my_id_form', function(data){   // из формы
  	console.log('мой id='+data[1]);
  	console.log('сообщение: '+data[0]);
  //console.log('ID сессии: '+reg.session.ID);
  });

  socket.on('id_on_read',function (data) {
      console.log('сессия из глобальной переменной id на read.php='+GLOBAL._sess);
      socket.emit('session_from_index',GLOBAL._sess);
  });
  /////// end считывание с формы и из read.php


	socket.on('send mess', function(data){
		
		/*
         fs.appendFileSync("hello.txt", data+" ||"); // записывает в файл
         
          var fileContent = fs.readFileSync("hello.txt", "utf8");  // читает из файла текстового

           var arrayOfmess = fileContent.split("||"); // массив с раздробленным по сообщениям из текстового файла
          */
           console.log('data[1]='+data[1]);
         io.sockets.emit('read_now', data);
	});

	 }); // end io.sockets.on

