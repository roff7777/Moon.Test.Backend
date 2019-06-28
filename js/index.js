$("body").delegate("#login", "click", function(){
    let user = {
        "username": $("#username").val()
    };
    $.ajax({
        url: '/user',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: user,
        success: function( data, textStatus, jQxhr ){
            loginExitoso();
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("Error al logear");
        }
    });
});

function loginExitoso(){

}



$(function () {
    var socket = io();
    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

    socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
    });
});