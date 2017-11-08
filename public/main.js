$(function() {
    var socket = io.connect();
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');
    var $messageArea = $('#messageArea');
    var $userFormArea = $('#userFormArea');
    var $userForm = $('#userForm');
    var $users = $('#users');
    var $username = $('#username');
    var $typing = $('#typing');

    $messageForm.submit(function(e) {
        e.preventDefault();
        socket.emit('send message', $message.val());
        $message.val('');
    });

    socket.on('new message', function(data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<div class="well">' + data[i].hour + ':' + data[i].min + ':' + data[i].sec +
            '<strong> ' + data[i].user + '</strong> says:<br> ' +
            data[i].msg + '</div>';
        }
        $chat.html(html);
        userIsTyping();
    });

    $userForm.submit(function(e) {
        e.preventDefault();
        socket.emit('new user', $username.val(), function(data) {
            if (data) {
                $userFormArea.hide();
                $messageArea.show();
            }
        });
        $username.val('');
    });

    socket.on('get users', function(data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<li class="list-group-item">' + data[i] + '</li>';
        }
        $users.html(html);
    });

    $message.keyup(function(e){
        e.preventDefault();
        socket.emit('user typing');
    });

    socket.on('show typing', function(data){
        userIsTyping(data);
    });
    
    function userIsTyping(data) {
        if(data != undefined){
            $typing.html(data + ' is typing...');
            setTimeout(stopIsTyping, 2500);
        }
    };

    function stopIsTyping() {
        $typing.html('Enter Message');
    };
});