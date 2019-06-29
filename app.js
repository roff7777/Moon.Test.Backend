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
    var user = {
        "userName": req.body.username,
        "socketId": req.body.socketid
    };
    var usuarioAux = obtenerUsuario(user.userName);
    if(usuarioAux == null){
        users.push(user);
        res.status(200).end();
    }
    actualizarUsuario(user);
    res.status(200).end();
});

app.delete('/user', function(req, res){
    users = {};
    res.status(200).end();    
});

function obtenerUsuario(userName){
    let userAux;
    for(var i= 0; i < users.length; i++){
        if(users[i].userName == userName){
            userAux = users[i];
        }
    }
    return userAux;
}

function actualizarUsuario(user){
    for(var i = 0; i < users.length; i++){
        if(users[i].userName == user.userName){
            users[i].socketId = user.socketId;
            return;
        }
    }
}


io.on('connection', function(socket){
    console.log('connected: ' + socket.id);
    io.to(socket.id).emit("socket connected", socket.id);

    socket.on('personal message', function(messageInfo){
        var usuario = obtenerUsuario(messageInfo.destinatario);
        if(usuario != null){
            io.to(usuario.socketId).emit('personal message', messageInfo.mensaje);
        }
    });
    
    socket.on('reload users', function(){
        io.emit('reload users');
    });

    socket.on('join chat', function(conversacion){
        var usuarioDestinatario = obtenerUsuario(conversacion.destinatario);
        var usuarioRemitente = obtenerUsuario(conversacion.remitente);
        io.to(usuarioDestinatario.socketId).emit('join chat', conversacion);
        io.to(usuarioRemitente.socketId).emit('join chat', conversacion);
    });




    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('chat message', function(roomMessage){
        io.to(roomMessage.room).emit('chat message', roomMessage);
    });


    socket.on('join chat verified', function(conversacion){
        socket.join(`${conversacion.remitente}-${conversacion.destinatario}`)
        io.emit('join chat verified', conversacion);
    });


});




http.listen(3000, function(){
  console.log('listening on *:3000');
});