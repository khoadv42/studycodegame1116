// const socket = io('https://typingame1119.herokuapp.com');
const socket = io('http://localhost:8080');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');

var signDiv = document.getElementById('signDiv');
var signDivUsername = document.getElementById('signDiv-username');
var signDivSignIn = document.getElementById('signDiv-signIn');
var signDivSignUp = document.getElementById('signDiv-signUp');
var signDivPassword = document.getElementById('signDiv-password');


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
socket.on('addToChat',function(data){
    console.log(data);
    chatText.innerHTML += '<div>'+data+'</div>';
});
chatForm.onsubmit = function(e){
    e.preventDefault();
    if(chatInput.value[0] === '/')
        socket.emit('evalServer',chatInput.value.slice(1));
    else 
        socket.emit('sendMsgToServer',chatInput.value);
    chatInput.value = '';
}
socket.on('evalAnswer',function(data){
    console.log(data);
});
socket.on('pos', function (data) {
    myPos.x = data.x;
    myPos.y = data.y;
});

signDivSignIn.onclick = function(){
    socket.emit('signIn',{username:signDivUsername.value,password:signDivPassword.value});
}
signDivSignUp.onclick = function(){
    socket.emit('signUp',{username:signDivUsername.value,password:signDivPassword.value});
}
socket.on('signInResponse',function(data){
    if(data.success){
        signDiv.style.display = 'none';
        gameDiv.style.display = 'inline-block';
    }else{
        alert("Sign in unsuccessul.");
    }
});
socket.on('signUpResponse',function(data){
    if(data.success){
        alert("Sign in successul.");
    }else{
        alert("Sign in unsuccessul.");
    }
});

document.addEventListener('keydown', function (event) {
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
