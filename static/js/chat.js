var socket;
var getMessageText, message_side, sendMessage;
message_side = 'right';
var me = "";

function leave_room() {
    socket.emit('left', {}, function() {
        socket.disconnect();

        //Go back to the login page
        window.location.href = "/";
    });
}

(function () {
	socket = io.connect('https://' + document.domain + '/chat');
    socket.on('connect', function() {
        socket.emit('joined', {});
    });
    socket.on('status', function(data) {
		if (data.id && me == "") me = data.id;
		// Special messages for status
        return sendMessage(data.msg, "status");
    });
    socket.on('message', function(data) {
        return sendMessage(data.msg, (data.sender == me) ? "right" : "left", data.sender);
    });
    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
				$message.find(".sender").html(arg.sender)
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    $(function () {
        getMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };
        sendMessage = function (text, message_side, sender) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message = new Message({
                text: text,
                message_side: message_side,
				sender: sender
            });
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };
        $('.send_message').click(function (e) {
			let msg = getMessageText();
			socket.emit('text', {msg: msg});
        });
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                let msg = getMessageText();
				socket.emit('text', {msg: msg});
            }
        });  
    });
}.call(this));