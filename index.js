var express=require('express');
var app=express();
var server=require('http').createServer(app);
var io=require('socket.io').listen(server);
const fs = require("fs");
//var mysql=require('mysql');

server.listen(3000);

app.get('/', function(request,respons){

	respons.sendFile(__dirname + '/index.html');
});


app.get('/read', function(request,respons){

	respons.sendFile(__dirname + '/read.html');
});

// Массив со всеми подключениями
var connections = [];

// Функция, которая сработает при подключении к странице
// Считается как новый пользователь
io.sockets.on('connection', function(socket) {
	console.log("Успешное соединение");
	// Добавление нового соединения в массив
	connections.push(socket);

	// Функция, которая срабатывает при отключении от сервера
	socket.on('disconnect', function(data) {
		// Удаления пользователя из массива
		connections.splice(connections.indexOf(socket), 1);
		console.log("Отключились");
	});

	socket.on('send mess', function(data){
		
         fs.appendFileSync("hello.txt", data+" ||"); // записывает в файл
         
          var fileContent = fs.readFileSync("hello.txt", "utf8");  // читает из файла текстового

           var arrayOfmess = fileContent.split("||"); // массив с раздробленным по сообщениям из текстового файла
         io.sockets.emit('read_now', arrayOfmess);
	});

	 }); // end io.sockets.on

