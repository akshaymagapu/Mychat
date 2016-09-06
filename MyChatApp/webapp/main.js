$(function() {
    // Initialize variables
    var $loginform = $('.loginform');
    var $login = $('.login');
    var $chatbox = $('.chatbox');
    var $messages = $('.messages');
    var $entermessage = $('.entermessage');
    var chatname;
    var message;
    var userconnected = false;
    var typing = false;
    var $currentPlace = $login.focus();
    var $window = $(window);
    var $loginbox = $('.loginbox');
    var $chat = $('.chat');
    var socket = io();

    $(".button").click(function() {
        $(".loginbox").show();
        $(".viewpage").hide();
    });

    function setChatName() {
        chatname = $login.val().trim();
        if (chatname !== 'undefined' && chatname !== "") {
            $loginbox.fadeOut();
            $chat.show();
            $loginbox.off('click');
            $currentPlace = $entermessage.focus();
            socket.emit('new user', chatname);
        }
    }

    function addUsersMessage(data) {
        if($chat.css('display') != 'none'){
        var message = '';
        if (data.numOfUsers === 1 ) {
            message += "You are the first to join!";
        } else {
            message += "Number of users " + data.numOfUsers;
        }
        log(message);
        }
    }

    function addChatMessage(data, options) {
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }
        var $chatnameDiv = $('<span class="chip"></span>')
            .text(data.chatname);
        var $messageBodyDiv = $('<span class="messageBody">')
            .text(data.message);
        var $messageDiv = $('<li class="message"/>')
            .data('chatname', data.chatname)
            .append($chatnameDiv, "&nbsp; :  &nbsp;&nbsp;", $messageBodyDiv);

        addMessageElement($messageDiv, options);
    }

    function sendChatMessage() {
        message = $entermessage.val();
        if (message && userconnected) {
            $entermessage.val('');
            addChatMessage({
                chatname: chatname,
                message: message
            });
            socket.emit('new message', message);
        }
    }
    

    function log(message, options) {
        var $element = $('<li>').addClass('log').text(message);
        addMessageElement($element, options);
    }

    function addMessageElement(element, options) {
        var $element = $(element);

        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        if (options.fade) {
            $element.hide().fadeIn(150);
        }
        if (options.prepend) {
            $messages.prepend($element);
        } else {
            $messages.append($element);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    $window.keydown(function(event) {
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentPlace.focus();
        }
        if (event.which === 13) {
            if (chatname) {
                sendChatMessage();
            } else {
                setChatName();
            }
        }
    });

    $(".enter").click(function() {
        if (chatname) {
            sendChatMessage();
        } else {
            setChatName();
        }
    });

    function getTypingMessages(data) {
        return $('.typing.message').filter(function(i) {
            return $(this).data('chatname') === data.chatname;
        });
    }

    socket.on('login', function(data) {
        userconnected = true;
        var message = "Welcome to chatroom!";
        log(message, {
            prepend: true
        });
        addUsersMessage(data);

    });

    socket.on('user joined', function(data) {
        log(data.chatname + ' joined');
        addUsersMessage(data);
    });

    socket.on('user left', function (data) {
        log(data.chatname + ' left');
        addUsersMessage(data);
    });

    socket.on('new message', function(data) {
        addChatMessage(data);
    });

});