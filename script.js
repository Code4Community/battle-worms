var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

//Define Variables
var player;
var stars;
//var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var bullet;
var asteroid;
var rover;


var game = new Phaser.Game(config);

//Enitity class that deinfes movement of the players and enemies
class Entity extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite, index) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.8, 0.8);
        this.setBounce(0.001);
        this.setCollideWorldBounds(true);
        scene.physics.add.collider(this, platforms);
        // creates number sprites above heads of Entity objects
        index++;
        this.headNumber = scene.physics.add.sprite(this.x, this.y - 10, 'num'+index);
        this.headNumber.body.allowGravity = false;
        this.headNumber.setScale(1.5);
    }

    // need to make move() function a Entity function

    // need to make jump() function a Entity function

    // need to make fire() function a Entity function

}

//Astronuats are the players
class Astronaut extends Entity {
    constructor(scene, x, y, index) {
        super(scene, x, y, 'astronautidle', index);
        index++;
        this.name = "Astronaut "+index;
    }
}

//Aliens are the enemies
class Alien extends Entity {
    constructor(scene, x, y, index) {
        super(scene, x, y, 'alienidle', index);
        index++;
        this.name = "Alien "+index;
    }
}
// Still need to add animations for moveLeft and moveRight
Entity.prototype.moveLeft = function() {
    this.setVelocityX(-160);
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
    this.setVelocityX(160);
    var that = this;
    setTimeout(function() {
        that.setVelocityX(0);
    }, 2000);
}

// need to add x and y velocity inputs
Entity.prototype.fire = function() {
    bullet.setPosition(this.x, this.y);
    bullet.setActive(true).setVisible(true);
    bullet.setVelocityX(-100);
    bullet.setVelocityY(-500);
}

function preload ()
{
    // Load all of the images and assign a name to them
    this.load.image('sky', 'assets/nightsky.png');
    this.load.image('ground', 'assets/Obstacle.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('asteroid', 'assets/asteroid.png');
    this.load.image('Rover', 'assets/Rover.png')
//  this.load.image('bomb', 'assets/bomb.png');   
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('astronautidle', 'assets/astroidle2.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('alienidle', 'assets/alienidle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('num1', 'assets/numbers/number1.png');
    this.load.image('num2', 'assets/numbers/number2.png');
    this.load.image('num3', 'assets/numbers/number3.png');
}

function create ()
{
    this.physics.world.setBounds(0,0,800,600);
    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    //Define Static Groups
    platforms = this.physics.add.staticGroup();
    asteroid  = this.physics.add.staticGroup();
    rover     = this.physics.add.staticGroup();
    

    // Here we create the ground.
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    // Place our static images on the screen
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
    asteroid.create(200,205, 'asteroid').setScale(.1).refreshBody();
    rover.create(700,340, 'Rover').setScale(.1).refreshBody();

    // The player and its settings
    player = this.physics.add.sprite(100, 400, 'dude');
    player.setSize(64, 64, true);
    player.setScale(0.8, 0.8);

    // Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

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
    
    astronauts = [];
    astronautsTotal = 3;
    astronautsLeft = 3;
    for(i=0; i < astronautsTotal; i++) {
        astronauts.push(new Astronaut(this, 50 + (i * 50), 450, i));
    }

    aliens = [];
    aliensTotal = 3;
    aliensLeft = 3;
    for(i=0; i < aliensTotal; i++) {
        aliens.push(new Alien(this, 200 + (i * 50), 450, i));
    }
   

    // still need to kill bullet on hitting ground
    // bullet.checkWorldBounds = true;

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

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    //bombs = this.physics.add.group();

    // The score
    scoreText = this.add.text(16, 16, 'Aliens: 0', { fontSize: '32px', fill: '#FFFFFF' });

    // Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bullet, platforms);
    this.physics.add.collider(player, asteroid);
    this.physics.add.collider(player, rover);
    this.physics.add.collider(player, bullet);
    //this.physics.add.collider(bombs, platforms);

    // Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    //this.physics.add.collider(player, bombs, hitBomb, null, this);

    //this.physics.add.collider(bullet, stars, bulletHitEdge, null, this);
    
    //this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
    for(i = 0; i < astronautsLeft; i++) {
        astronauts[i].headNumber.setPosition(astronauts[i].x, astronauts[i].y - 40);
    }

    for(i = 0; i < aliensLeft; i++) {
        aliens[i].headNumber.setPosition(aliens[i].x, aliens[i].y - 40);
    }

    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
        player.flipX=true;
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
        player.flipX=false;
        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn', true);
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }

    if(spacebar.isDown) {
        fire();
    }

    if(keyL.isDown) {
        astronauts[0].moveLeft();
    }

    if(keyR.isDown) {
        astronauts[1].moveRight();
    }

    if(keyF.isDown) {
        astronauts[2].fire();
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);

    //  Add and update the score
    score += 1;
    scoreText.setText('Aliens: ' + score);

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        //var bomb = bombs.create(x, 16, 'bomb');
        //bomb.setBounce(1);
        //bomb.setCollideWorldBounds(true);
        //bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        //bomb.allowGravity = false;

    }
}

/*function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}*/

// fires the bullet from the player
// this function is not necessary for final game, just test shooting from player
function fire() {

        this.bullet.setPosition(this.player.x, this.player.y);
        bullet.setActive(true).setVisible(true);

        this.bullet.setVelocityX(-100);
        this.bullet.setVelocityY(-500);
}

function disappearBullet() {
    bullet.setActive(false).setVisible(false);
}