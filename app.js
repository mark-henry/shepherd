'use strict';

(function(){ 

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update});
var group_sheep, group_grass, player;
var sheep_list = [];
var cursors;

function preload() {
  game.load.image('grass', 'assets/grass.png');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);

  group_grass = game.add.group();

  group_sheep = game.add.group();
  for (var i = 0; i < 32; i++) {
    group_sheep.addChild(Sheep());
  }

  player = game.add.sprite(33, 60);
  game.physics.enable(player);
  player.addChild(
      game.add.graphics()
        .beginFill(0x0000FF, 1)
        .drawRect(-5, 0, 10, -20)
        .endFill());
  player.body.collideWorldBounds = true;

  cursors = game.input.keyboard.createCursorKeys();
}

function Sheep() {
  var sheep = game.add.sprite(50 + (sheep_list.length % 10) * 12, 50 + (sheep_list.length * 12) / 10);
  game.physics.enable(sheep);
  sheep.body.collideWorldBounds = true;

  sheep.addChild(
    game.add.graphics()
      .beginFill(0xFFFFFF, 1)
      .drawRect(-5, -5, 10, 10)
      .endFill());

  sheep.update = function() {
    sheep.rotation = Math.atan2(sheep.body.velocity.y, sheep.body.velocity.x);
  };

  sheep_list.push(sheep);

  return sheep;
}

function update() {
  playerMovement();
  flockSheep();
  // game.physics.arcade.collide(sheep_list, sheep_list);
}

var sepDist = 360,
  sepForce = 10,
  alignDist = 350,
  alignForce = 5,
  cohesForce = 5;
function flockSheep() {
  sheep_list.forEach(function(thisSheep) {
    var diffX, diffY, distSquared, magnitude;
    var sepForceX = 0, sepForceY = 0;
    var cohesForceX = 0, cohesForceY = 0;
    var alignForceX = 0, alignForceY = 0;

    // Be herded by the player
    diffX = player.body.position.x - thisSheep.body.position.x;
    diffY = player.body.position.y - thisSheep.body.position.y;
    distSquared = (diffX * diffX) + (diffY * diffY);
    if (distSquared < sepDist*32) {
      sepForceX += diffX;
      sepForceY += diffY;
    }

    // React to other sheep
    sheep_list.forEach(function(thatSheep) {
      if (thisSheep === thatSheep) { return; }
      diffX = thatSheep.body.position.x - thisSheep.body.position.x;;
      diffY = thatSheep.body.position.y - thisSheep.body.position.y;
      distSquared = (diffX * diffX) + (diffY * diffY);

      if (distSquared < sepDist) {
        sepForceX += diffX;
        sepForceY += diffY;
      } else {
        cohesForceX += diffX;
        cohesForceY += diffY;
        if (distSquared < alignDist) {
          alignForceX += thatSheep.body.velocity.x;
          alignForceY += thatSheep.body.velocity.y;
        }
      }
    });

    thisSheep.body.acceleration.x = 0;
    thisSheep.body.acceleration.y = 0;

    magnitude = hypot(sepForceX, sepForceY);
    thisSheep.body.acceleration.x -= (sepForce * sepForceX / magnitude) || 0;
    thisSheep.body.acceleration.y -= (sepForce * sepForceY / magnitude) || 0;

    magnitude = hypot(cohesForceX, cohesForceY);
    thisSheep.body.acceleration.x += (cohesForce * cohesForceX / magnitude) || 0;
    thisSheep.body.acceleration.y += (cohesForce * cohesForceY / magnitude) || 0;

    magnitude = hypot(alignForceX, alignForceY);
    thisSheep.body.acceleration.x += (alignForce * alignForceX / magnitude) || 0;
    thisSheep.body.acceleration.y += (alignForce * alignForceY / magnitude) || 0;
  });

  var speedLimitRoot = 20;
  sheep_list.forEach(function(thisSheep) {
    // Normalize speed to speed limit if necessary
    var distSquared = thisSheep.body.velocity.x*thisSheep.body.velocity.x + thisSheep.body.velocity.y*thisSheep.body.velocity.y;
    if (distSquared > speedLimitRoot*speedLimitRoot) {
      var normalFactor = speedLimitRoot / hypot(thisSheep.body.velocity.x, thisSheep.body.velocity.y);
      // normalFactor *= .9;  // Put drag on sheep's movement
      thisSheep.body.velocity.x *= normalFactor;
      thisSheep.body.velocity.y *= normalFactor;
    }
  });
}

// double-dog-leg hypothenuse approximation
// http://forums.parallax.com/discussion/147522/dog-leg-hypotenuse-approximation
function hypot(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  var lo = Math.min(a, b)
  var hi = Math.max(a, b)
  return hi + 3 * lo / 32 + Math.max(0, 2 * lo - hi) / 8 + Math.max(0, 4 * lo - hi) / 16
}

function playerMovement() {
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (cursors.left.isDown) { player.body.velocity.x = -100; }
    if (cursors.right.isDown) { player.body.velocity.x = 100; }
    if (cursors.up.isDown) { player.body.velocity.y = -100; }
    if (cursors.down.isDown) { player.body.velocity.y = 100; }
}

}());