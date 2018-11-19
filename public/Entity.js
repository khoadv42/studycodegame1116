var Entity = function (id) {
    var self = {
        id:id,
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

    return self;
}
module.exports = Entity;
