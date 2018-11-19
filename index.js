// var Player = require("./public/Player");
var express = require('express');
var path = require('path');
var app = express();

var serv = require('http').Server(app);
serv.listen(process.env.PORT || 8080, function () {
    console.log("server start");
});
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/public', 'index.html'));
});
app.use('/public', express.static(__dirname + '/public'));

var LIST_SOCKETS = [];
var socketId = 0.0;
var Entity = function (id) {
    var self = {
        id: id,
        x: 250,
        y: 250,
        spdX: 0,
        spdY: 0,
    }
    self.update = function () {
        self.updatePosition();
    }
    self.updatePosition = function () {
        self.x += self.spdX;
        self.y += self.spdY;
    }
    self.getDistance = function (pt) {
        return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
    }

    return self;
}

var Player = function (id) {
    var self = Entity(id);
    self.maxSpd = 10;
    self.number = Math.floor(Math.random() * 10 + 10);
    self.pressingUp = false;
    self.pressingDown = false;
    self.pressingLeft = false;
    self.pressingRight = false;
    self.pressingAttack = false;
    self.mouseAngle = 0;

    var super_update = self.update;

    self.update = function () {
        self.updateSpd();
        super_update();
        if (self.pressingAttack) {
            for(var i = -2; i <= 2  ;i++){
                self.shootBullet(i*10 + self.mouseAngle);
            }
        }
    }
    self.shootBullet = function (angle) {
        var bullet = Bullet(self.id, angle);
        bullet.x = self.x;
        bullet.y = self.y;
    }
    self.updateSpd = function () {
        if (self.pressingUp) {
            self.spdY = -self.maxSpd;
        } else if (self.pressingDown) {
            self.spdY = self.maxSpd;
        } else self.spdY = 0;

        if (self.pressingLeft) {
            self.spdX = -self.maxSpd;
        } else if (self.pressingRight) {
            self.spdX = self.maxSpd;
        } else self.spdX = 0;

    }
    Player.list[self.id] = self;
    console.log(self);
    return self;
}
Player.list = [];
Player.onConnect = function (socket) {
    var player = Player(socket.id);
    socket.on('keyPress', function (data) {
        if (data.inputId === "left") {
            player.pressingLeft = data.state;
        } else if (data.inputId === "right") {
            player.pressingRight = data.state;
        } else if (data.inputId === "up") {
            player.pressingUp = data.state;
        } else if (data.inputId === "down") {
            player.pressingDown = data.state;
        } else if (data.inputId == 'attack') {
            player.pressingAttack = data.state;
        } else if (data.inputId == 'mouseAngle') {
            player.mouseAngle = data.state;
        }
    });
}
Player.onDisconnect = function (socket) {
    delete Player.list[socket.id];
}
Player.update = function () {
    var pack = [];
    for (let i in Player.list) {
        var player = Player.list[i];
        player.update();
        pack.push({
            x: player.x,
            y: player.y,
            number: player.number,
        });
    }
    return pack;
}

var Bullet = function (parent, angle) {
    var self = Entity(Math.random());
    self.maxSpd = 10
    self.spdX = Math.cos(angle / 180 * Math.PI) * self.maxSpd;
    self.spdY = Math.sin(angle / 180 * Math.PI) * self.maxSpd;
    self.parent = parent;
    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function () {
        if (self.timer++ > 100) {
            self.toRemove = true;
        }
        super_update();
        for(var i in Player.list){
            var p = Player.list[i];
            if(self.getDistance(p) < 32 && self.parent !== p.id){
                self.toRemove = true;
            }
        }
    }

    Bullet.list[self.id] = self;
    return self;
}
Bullet.list = [];
Bullet.update = function () {
    var pack = [];
    for (let i in Bullet.list) {
        var bullet = Bullet.list[i];
        bullet.update();
        if (bullet.toRemove) {
            delete Bullet.list[i];
        } else {
            pack.push({
                x: bullet.x,
                y: bullet.y,
            });
        }
    }
    return pack;
}

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    socket.id = Math.floor(Math.random() * 10);
    socketId = socket.id;
    console.log('connected', socket.id);

    LIST_SOCKETS[socket.id] = socket;
    Player.onConnect(socket);

    socket.on('disconnect', function () {
        console.log('disconnect', socket.id);
        Player.onDisconnect(socket);
    });
});

setInterval(function () {
    var pack = {
        player: Player.update(),
        bullet: Bullet.update(),
    };
    for (let i in LIST_SOCKETS) {
        var socket = LIST_SOCKETS[i];
        if(Player.list[i]){
            var player = Player.list[i];
            socket.emit('pos', { x: player.x, y: player.y });
        }
        socket.emit('newPos', pack);
    }
}, 1000 / 25);