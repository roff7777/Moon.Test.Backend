var bodyParser = require('body-parser');
var app = require('express')();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var http = require('http').createServer(app);

var io = require('socket.io')(http);
var users = new Array();


//Metodos de API
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/user', function(req, res){
    res.json(users);
});

app.post('/user', function(req, res){
    //TODO: Agregar validacion para evitar usuarios duplicados
    users.push(req.body.username);
    res.status(200).end();
});

app.delete('/user', function(req, res){
    users = [];
    res.status(200).end();    
});


io.on('connection', function(socket){
    console.log('a user connected');
    
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('chat message', function(roomMessage){
        io.to(roomMessage.room).emit('chat message', roomMessage);
    });

    socket.on('join chat', function(conversacion){
        console.log("Intento de conexion");
        io.emit('join chat', conversacion);
    });

    socket.on('join chat verified', function(conversacion){
        console.log("Unido");
        socket.join(`${conversacion.remitente}-${conversacion.destinatario}`)
        io.emit('join chat verified', conversacion);
    });


});




http.listen(3000, function(){
  console.log('listening on *:3000');
});