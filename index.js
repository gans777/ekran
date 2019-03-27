var express=require('express');
var app=express();

var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser=require('body-parser');// эксперимент, может и не надо это( вроде и не надо-- пока страшно убирать)

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


server.listen(3000);

app.get('/', function(request,respons){


	respons.sendFile(__dirname + '/index.html');
});


GLOBAL._sess=0; // глобальная переменная - через неё передаются сессии

app.get('/glob',function (request,respons) {   // здесь генерятся сессии

    GLOBAL._sess=request.session.id;
    var html=request.session.id; // на html странице id сессии выводится просто так
    respons.send(html);
})



var count=0; // счетчик сокет-соединений - практического смысла нет
// Массив со всеми подключениями
var connections = [];

console.log(' сервер node.js включен')


io.sockets.on('connection', function (socket) {
	count++;

	console.log("Успешное соединение нового сокета"+count);
    socket["id_socket"]=count; // в объекте socket создается новая ячейка для счетчика



    socket.on('id_connected',function(data){ // слушает подключение id со страницы reception.php
        // var online_connect=[data,count];

        console.log('подключился id='+data+'c номером соединения'+count);

        socket["id_user"]=data;// создается ячейка в объекте socket с id пользователя

        io.sockets.emit('id_connected_to', data);

    });


	// Добавление нового соединения в массив

	connections.push(socket);

	socket.on('id_status_reload',function () {
        var zx=connections.length;
        console.log('количество соединений '+zx);

        connections.forEach(function(element) {

            if (typeof element["id_user"] === 'undefined') {

              //  ячейка в объекте socket с id пользователя
                      console.log('переменная неопределена '+element["id_user"]);

            } else {

                console.log('переменная определена '+element["id_user"]);
             var   data= element["id_user"];// создается ячейка в объекте socket с id пользователя

                io.sockets.emit('id_connected_to', data);
            }
                    });

    });




     socket.emit('my_socket', socket["id_socket"]); // передается порядковый от включения номер сокета (читает его read.php -- если там не нужен, то можно удалить)

    /*
     socket.on('session_on', function (data) {  // слушает session_on -зачем???   удалить???
        console.log("my id from socket="+ data);
     });
*/

	// Функция, которая срабатывает при отключении от сервера
	socket.on('disconnect', function(data) {
		// Удаления пользователя из массива
		console.log('отключилось соединение '+socket["id_socket"]);

		if (socket["id_user"]!==undefined) {
            console.log('отключился юзер='+socket["id_user"]);
            io.sockets.emit('id_connected_to_off', socket["id_user"]);// отправляет id отключившегося юзера
        }
		connections.splice(connections.indexOf(socket), 1);
		console.log("Отключилось");
        	});


  socket.on('my_id_form', function(data){   // из формы передаваемые данные - это контроль - можно удалить
  	console.log('из формы пользователя id='+data[1]);
  	console.log('сообщение: '+data[0]);

  });

  socket.on('id_on_read',function (data) {
      console.log('сессия из глобальной переменной id на read.php='+GLOBAL._sess);
      socket.emit('session_from_index',GLOBAL._sess);   //передает на read.php id-сессии
  });



	socket.on('send mess', function(data){   //  data - это массив из формы, где data[1]-id , data[0]-сообщение
		


         io.sockets.emit('read_now', data);
	});



	 }); // end io.sockets.on

