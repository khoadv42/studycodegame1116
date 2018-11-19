var Entity = require('./Entity');
var Player = function(id){
    var self = Entity(id);
    self.maxSpd = 10;
    self.number = Math.floor(Math.random() * 10 + 10);
    self.pressingUp = false;
    self.pressingDown = false;
    self.pressingLeft = false;
    self.pressingRight = false;

    var super_update = self.update;

    self.update = function(){
        self.updateSpd();
        super_update();
    }
    
    self.updateSpd = function(){
        if(self.pressingUp){
            self.spdY = -self.maxSpd;
        }else if(self.pressingDown){
            self.spdY = self.maxSpd;
        }else self.spdY = 0;

        if(self.pressingLeft){
            self.spdX = -self.maxSpd;
        }else if(self.pressingRight){
            self.spdX = self.maxSpd;
        }else self.spdX = 0;
    }
    Player.list[self.id] = self;
    console.log(self);
    return self;
}

Player.list = [];
Player.onConnect = function(socket){
    var player = Player(socket.id);
    socket.on('keyPress',function(data){
        if(data.inputId === "left"){
            player.pressingLeft = data.state;
        }else if(data.inputId === "right"){
            player.pressingRight = data.state;
        }else if(data.inputId === "up"){
            player.pressingUp = data.state;
        }else if(data.inputId === "down"){
            player.pressingDown = data.state;
        }
    });
}
Player.onDisconnect = function(socket){
    delete Player.list[socket.id];   
}

module.exports = Player;