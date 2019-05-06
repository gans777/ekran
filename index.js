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


server.listen(3000, '192.168.10.182', function () {
    console.log('Server start')
});

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

console.log(' сервер node.js включен_');


io.sockets.on('connection', function (socket) {
	count++;

	console.log("Успешное соединение нового сокета"+count);
    socket["id_socket"]=count; // в объекте socket создается новая ячейка для счетчика
    socket.emit('i_new_connect', count);



    socket.on('id_connected',function(data){ // слушает подключение id со страницы reception.php

        console.log('подключился id='+data+'c номером соединения'+count);

        socket["id_user"]=data;// создается ячейка в объекте socket с id пользователя

        io.sockets.emit('id_connected_to', data);
        io.sockets.emit('break_point_status_flag_to_terminal', data); // проверка стоит ли флаг перерыва(тоесть перевызываются функции, проверяющие в terminal.php check перерыва продавца)

    });


	// Добавление нового соединения в массив

	connections.push(socket);

	socket.on('id_status_reload',function (data) {
	    console.log(data);
        var zx=connections.length;
        console.log('количество соединений '+zx);

        connections.forEach(function(element) {

            if (typeof element["id_user"] === 'undefined') {

              //  ячейка в объекте socket с id пользователя
                     // console.log('переменная неопределена '+element["id_user"]);

            } else {

                console.log('переменная определена '+element["id_user"]);
             var   data= element["id_user"];// создается ячейка в объекте socket с id пользователя

                console.log('переменная определена '+element["id_user"]);

                io.sockets.emit('id_connected_to', data);

            }
                    });

    });




    // socket.emit('my_socket', socket["id_socket"]); // передается порядковый от включения номер сокета (читает его read.php -- если там не нужен, то можно удалить)

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

  socket.on('terminal_online',function(data){ // проверка связи с терминалом(отдача\прием сообщений для проверки)
      io.sockets.emit('online_on','online');
  });


	socket.on('send mess', function(data){   //  data - это массив из формы, где data[1]-id , data[0]-сообщение

        console.log("(read_now)ID POINT="+data[1]);
        console.log("MESS="+data[0]);

         io.sockets.emit('read_now', data);
	});


	
	socket.on('connect_card', function(data){  // произошло открытие корзины

	    console.log('необходимый id ларька ' + data);
        io.sockets.emit('break_point_status_flag_to_terminal', data); // проверка стоит ли флаг перерыва(тоесть перевызываются функции, проверяющие в terminal.php check перерыва продавца)
/////////////////////////////////
        var Curl = require( 'node-libcurl' ).Curl;

        var curl = new Curl();

        curl.setOpt( Curl.option.URL, 'http://larek-online.ru/common/ajax/ajax-reguest.php?id_point='+data+'&act_label=ask_time_work' );
        curl.setOpt( 'FOLLOWLOCATION', true );

        curl.on( 'end', function( statusCode, body, headers, data ) {

            //console.info( statusCode );
            //console.info( '---' );
            //console.info( body.length );
            //console.info('я тело ответа' + body );
            if (Number(body)==1) {console.log('по расписанию ларек ОТКРЫТ');
                io.sockets.emit ('lar_open', 'this point open');
            }

            if (Number(body)==2) {console.log('по расписанию ларек ЗАКРЫТ');
            io.sockets.emit ('lar_close', 'this point close');
            }
            
           // console.info( headers );
            //console.info( '---' );
            //console.info( this.getInfo( Curl.info.TOTAL_TIME ) );

            this.close();
        });

        curl.on( 'error', function( err, curlErrorCode ) {

            console.error( err.message );
            console.error( '---' );
            console.error( curlErrorCode );

            this.close();

        });

        curl.perform();
        ////////////////////////////////////////

        var flag_some = 2;
        connections.some(function(element){ // при первом совпадении обход прерывается

          if  (element["id_user"] == data) {

              console.log('покупатель с корзиной подключен и продавец '+ data + 'online');
              
              io.sockets.emit('seller_online', data);  // надо бы чтобы информация ушла строго на этот сокет, а не рупором по всем!!!!!!!!!!
              flag_some = 1;
              return;
          } 
            }
   
        );
        if (flag_some ==2) {
            io.sockets.emit('id_connected_to_off', data);
        }
    });

	socket.on('break_point', function(data){
	    console.log(data + ' продавец пошел на перерыв');
	    io.sockets.emit('break_point_to',data);
    });

    socket.on('break_point_off', function(data){
        console.log(data + ' продавец вернулся с перерыва');
        io.sockets.emit('break_point_to_back',data);
    });


	
	 }); // end io.sockets.on

