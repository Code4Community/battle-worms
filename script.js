//Define Variables
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var bullet;
var rover;
var screenWidth = 800;
var scrollWidth = 2*screenWidth; // width of the rolling screen
var screenHeight = 600;
var astroTurnCounter = 0;
var astroTurn; // astroTurn is true if it's the player's turn.

//Config data used to build the game
var config = {
    type: Phaser.AUTO,
    width: screenWidth,
    height: screenHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

//Define the game
var game = new Phaser.Game(config);

// Enitity class that defines movement of the players and enemies
class Entity extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite, index) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.8, 0.8);
        this.setBounce(0.3);
        this.setCollideWorldBounds(true);
        scene.physics.add.collider(this, platforms);

        // isJumping is true when the player is jumping.
        var isJumping = false;

        // Creates number sprites above heads of Entity objects.
        index++;
        this.headNumber = scene.physics.add.sprite(this.x, this.y - 10, 'num'+index);
        this.headNumber.body.allowGravity = false;
        this.headNumber.setScale(1.5);
    }

}

// Astronuats are the players.
class Astronaut extends Entity {
    constructor(scene, x, y, index) {
        super(scene, x, y, 'astronautidle', index);
        index++;
        this.name = "Astronaut "+index;
    }
}

// Aliens are the computer-controlled enemies.
class Alien extends Entity {
    constructor(scene, x, y, index) {
        super(scene, x, y, 'alienidle', index);
        index++;
        this.name = "Alien "+index;
    }
}
// Still need to add animations for moveLeft and moveRight.
Entity.prototype.moveLeft = function() {
    this.setVelocityX(-140);
    /*
        Next few lines change velocity back to zero after 2 seconds.
        Written this way because the first parameter has to be a function object, not a function's return value.
        Same goes for moveRight.
        - Carter
    */
   var that = this;
    setTimeout(function() {
        that.setVelocityX(0);
    }, 2000);
}

Entity.prototype.moveRight = function() {
    this.setVelocityX(140);
    var that = this;
    setTimeout(function() {
        that.setVelocityX(0);
    }, 2000);
}

Entity.prototype.jumpLeft = function() {
    if(this.body.touching.down) {
        this.setVelocityY(-300);
        this.setVelocityX(-140);
        this.isJumping = true;
    }
}

Entity.prototype.jumpRight = function() {
    if(this.body.touching.down) {
        this.setVelocityY(-300);
        this.setVelocityX(140);
        this.isJumping = true;
    }
}




// Need to add x and y velocity inputs.
Entity.prototype.fire = function() {
    bullet.setPosition(this.x, this.y);
    bullet.setActive(true).setVisible(true);
    bullet.setVelocityX(-100);
    bullet.setVelocityY(-500);
}


// An easy alien turn that chooses one of the five moves to do
Alien.prototype.easyTurn = function() {
    var min = 1;
    var max = 6;
    var myRand = Math.floor(Math.random() * (max - min)) + min;
   
    //console.log(myRand);
   

    switch(myRand) {
        case 1:
            this.moveLeft();
            //console.log("moving left");
            break;
        case 2:
            this.moveRight();
            //console.log("moving right");
            break;
        case 3:
            this.fire();
           // console.log("firing");
            break;
        case 4:
            this.jumpLeft();
            //console.log("jumping left");
            break;
        case 5:
            this.jumpRight();
            //console.log("jumping left");
            break;
         //default:

    }

}

// Function that does the astronauts manual turn
/*
function manualTurn(currentAstro) {
    var counter = 2;

    input = prompt();
    while(counter >= 0) {
        switch(input) {
            case "L":
                astronauts[currentAstro].moveLeft();
                counter--;
            default:
        }

    }
}
*/


function preload ()
{
    // Load all of the images and assign a name to them
    this.load.image('sky', 'assets/nightsky.png');
    this.load.image('ground', 'assets/Obstacle.png');
    this.load.image('Rover', 'assets/Rover.png');
    this.load.spritesheet('humanobstacle', 'assets/humanObstacles.png', {frameWidth: 64, frameHeight: 64});
    this.load.spritesheet('astronautidle', 'assets/astroidle2.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('alienidle', 'assets/alienidle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('num1', 'assets/numbers/number1.png');
    this.load.image('num2', 'assets/numbers/number2.png');
    this.load.image('num3', 'assets/numbers/number3.png');
    this.load.image('Spaceship', 'assets/Spaceship.png');
}

function create ()
{
    this.physics.world.setBounds(0,0,scrollWidth,screenHeight);
    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    // Define Static Groups
    platforms = this.physics.add.staticGroup();
    rover     = this.physics.add.staticGroup();
    Spaceship = this.physics.add.staticGroup();

    // Here we create the ground.
    platforms.create(600, 650, 'ground').setScale(3).refreshBody();

    // Place our static images on the screen
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
    rover.create(700,340, 'Rover').setScale(.1).refreshBody();
    Spaceship.create(750,30, 'Spaceship').setScale(.1).refreshBody();

    // The player and its settings
    player = this.physics.add.sprite(100, 400, 'dude');
    player.setSize(64, 64, true);
    player.setScale(0.8, 0.8);

    // [0] for large rock, [1] for small rocks, [2] for small crates, [3] for large crate
    rover.create(700,350, 'rover').setScale(.1).refreshBody();

    // Bullet physics and properties
    bullet = this.physics.add.sprite(200, 10, '1bitblock1.png');
    disappearBullet();
    bullet.body.collideWorldBounds = true;
    bullet.body.onWorldBounds = true;

    this.physics.world.on('worldbounds', (body, up, down, left, right)=>
    {
        if(up || down || left || right) {
        disappearBullet();
    }});

    // It is the player's turn first.
    astroTurn = true;

    astronauts = [];
    astronautsTotal = 3;
    astronautsLeft = 3;
    for(i=0; i < astronautsTotal; i++) {
        // Here is where we decide where Astronouts start
        astronauts.push(new Astronaut(this, 800 + (i * 50), 450, i));
    }

    aliens = [];
    aliensTotal = 3;
    aliensLeft = 3;
    for(i=0; i < aliensTotal; i++) {
        // Here is where we decide where Aliens start.
        aliens.push(new Alien(this, 400 + (i * 50), 450, i));
    }

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('astronautidle', { start: 0, end: 29 }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: this.anims.generateFrameNumbers('astronautidle', { start: 0, end: 29 }),
        frameRate: 6,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('astronautidle', { start: 0, end: 29 }),
        frameRate: 5,
        repeat: -1
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();
    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keyL = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);

    //bombs = this.physics.add.group();

    // The score
    scoreText = this.add.text(16, 16, 'Aliens: 0', { fontSize: '32px', fill: '#FFFFFF' });

    // Collide the player and the stars with the platforms
    this.physics.add.collider(bullet, platforms);
    this.cameras.main.setBounds(0, 0,scrollWidth, screenHeight);
}


function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }



  function update ()
{

   
    /*
    Keeps the numbers over the heads of the astronauts and aliens.
    */
    for(i = 0; i < astronautsLeft; i++) {
        astronauts[i].headNumber.setPosition(astronauts[i].x, astronauts[i].y - 40);
    }
    for(i = 0; i < aliensLeft; i++) {
        aliens[i].setPosition(aliens[i].x,250);
        aliens[i].headNumber.setPosition(aliens[i].x, aliens[i].y - 40);
    }

    /*
    Checks if any of the aliens are in process of jumping.
    If they have started jump and are touching ground,
    the jump is over and they stop moving in X direction.
    */
    for(i = 0; i < aliensTotal; i++) {
        if(aliens[i].isJumping && aliens[i].body.touching.down) {
            aliens[i].isJumping = false;
            aliens[i].setVelocity(0);
        }
    }
    /*  
    Checks if any of the astronauts are in process of jumping.
    If they have started jump and are touching ground,
    the jump is over and they stop moving in X direction.
    */
    for(i = 0; i < astronautsTotal; i++) {
        if(astronauts[i].isJumping && astronauts[i].body.touching.down) {
            astronauts[i].isJumping = false;
            astronauts[i].setVelocity(0);
        }
    }

    if(bullet.body.touching.down) {
        disappearBullet();
    }

    /*
    Checks if its astronauts' turn or aliens' turn.
    */
    if(astroTurn) {

       
       //manualTurn(1);
       

        astroTurn = false;
        astroTurnCounter = 0;
    } else {
        /*
        Checks that everything is still and then runs next action of the aliens.
        Aliens take three actions.
        */
        aliens[0].easyTurn();
        while(!allStopped(aliens, astronauts) && (bullet.body.velocity == 0));
        aliens[1].easyTurn();
        while(!allStopped(aliens, astronauts) && (bullet.body.velocity == 0));
        aliens[2].easyTurn();
        while(!allStopped(aliens, astronauts) && (bullet.body.velocity == 0));

        astroTurn = true;
        //console.log("astro turn changes");
    }

    bulletTouchingSprite()

    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        this.cameras.main.scrollX -= 5;
    }
    if (cursors.right.isDown)
    {
        this.cameras.main.scrollX += 5;
    }

    if(keyL.isDown) {
        astronauts[0].moveLeft();
        astroTurnCounter++;
    }

    if(keyR.isDown) {
        astronauts[1].moveRight();
        astroTurnCounter++;
    }

    if(keyF.isDown) {
        astronauts[1].fire();
        astroTurnCounter++;
    }
    

    if(keyJ.isDown) {
        aliens[0].jumpLeft();
    }

    if(keyK.isDown) {
        aliens[1].jumpRight();
    }

}

function bulletTouchingSprite(){
    //if it is the astro turn or if alien turn
    //remove the ! when the turns are configured 
    if(!astroTurn){
        //check if alien is intersecting bullet
        for(i = 0; i<aliensTotal; i++)
        {
            var alienBound = aliens[i].getBounds();
            var bulletBounds = bullet.getBounds();
            if(Phaser.Geom.Intersects.RectangleToRectangle(alienBound,bulletBounds))
            {
                disappearBullet();
            }
        }
    } else {
        //check if astro is intersecting bullet
        for(i = 0; i<astronautsTotal; i++)
        {
            var astroBound = astronauts[i].getBounds();
            var bulletBounds = bullet.getBounds();
            if(Phaser.Geom.Intersects.RectangleToRectangle(astroBound,bulletBounds))
            {
                disappearBullet();
            }
        }
    }

}

function disappearBullet() {
    bullet.setActive(false).setVisible(false);
}

/*
    Returns boolean that is true if all the aliens and astronauts are not moving.
*/
function allStopped(aliens, astronauts) {
    var allStopped = true;
    for(i = 0; i < aliensTotal; i++) {
        allStopped = allStopped && (aliens[i].body.velocity == 0);
        allStopped = allStopped && (astronauts[i].body.velocity == 0);
    }
    return allStopped;
}