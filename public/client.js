const socket = io(' https://typingame1119.herokuapp.com');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var myPos = {
    x: 250,
    y: 250,
};
ctx.font = '30px Arial';
socket.on('newPos', (data) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < data.player.length; i++) {
        ctx.fillText(data.player[i].number, data.player[i].x, data.player[i].y);
    }
    for (var i = 0; i < data.bullet.length; i++) {
        ctx.fillRect(data.bullet[i].x - 5, data.bullet[i].y - 5, 10, 10);
    }
});

socket.on('pos', function (data) {
    myPos.x = data.x;
    myPos.y = data.y;
});
document.addEventListener('keydown', function (event) {
    console.log(event.keyCode);
    if (event.keyCode == 37) {
        socket.emit('keyPress', { inputId: 'left', state: true });
    }
    if (event.keyCode == 38) {
        socket.emit('keyPress', { inputId: 'up', state: true });
    }
    if (event.keyCode == 39) {
        socket.emit('keyPress', { inputId: 'right', state: true });
    }
    if (event.keyCode == 40) {
        socket.emit('keyPress', { inputId: 'down', state: true });
    }
});
document.addEventListener('keyup', function (event) {
    if (event.keyCode == 37) {
        socket.emit('keyPress', { inputId: 'left', state: false });
    }
    if (event.keyCode == 38) {
        socket.emit('keyPress', { inputId: 'up', state: false });
    }
    if (event.keyCode == 39) {
        socket.emit('keyPress', { inputId: 'right', state: false });
    }
    if (event.keyCode == 40) {
        socket.emit('keyPress', { inputId: 'down', state: false });
    }
});

document.addEventListener('mousedown', function (event) {
    socket.emit('keyPress', { inputId: 'attack', state: true });
});
document.addEventListener('mouseup', function (event) {
    socket.emit('keyPress', { inputId: 'attack', state: false });
});
document.addEventListener('mousemove', function () {
    var x = -myPos.x + event.clientX - 8;
    var y = -myPos.y + event.clientY - 8;
    var angle = Math.atan2(y, x) / Math.PI * 180;
    socket.emit('keyPress', { inputId: 'mouseAngle', state: angle });
});
