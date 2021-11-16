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

var player;
var stars;
//var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var bullet;

var game = new Phaser.Game(config);

class Entity extends Phaser.GameObjects.Sprite {
    constructor(scene,x,y) {
        super(scene,x,y);
    }

    // need to make move() function a Entity function


    // need to make jump() function a Entity function

    // need to make fire() function a Entity function

}

class Astronaut extends Entity {
    constructor(scene, x, y, index) {
        super(scene, x, y);
        this.setTexture('astronautidle');
        this.setPosition(x,y);
        this.name = "Astronaut "+index;
    }
}

class Alien extends Entity {
    constructor(scene, x, y,index) {
        super(scene, x, y);
        this.setTexture('dude');
        this.setPosition(x,y);
        this.name = "Alien "+index;
    }
}

function preload ()
{
    this.load.image('sky', 'assets/nightsky.png');
    this.load.image('ground', 'assets/Obstacle.png');
    this.load.image('star', 'assets/star.png');
//  this.load.image('bomb', 'assets/bomb.png');   
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('astronautidle', 'assets/AstronautOrng (1).png', { frameWidth: 48, frameHeight: 48 });
}

function create ()
{
    this.physics.world.setBounds(0,0,800,600);
    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // The player and its settings
    player = this.physics.add.sprite(100, 400, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // bullet physics and properties
    bullet = this.physics.add.sprite(200, 10, '1bitblock1.png');
    disappearBullet();
    //bullet.setCollideWorldBounds(true);
    bullet.body.collideWorldBounds = true;
    bullet.body.onWorldBounds = true;

    this.physics.world.on('worldbounds', (body, up, down, left, right)=>
    {
        if(up || down || left || right) {
        disappearBullet();
    }});
    
    
    var Ast = this.add.existing(new Astronaut(this,150,450,1));
    var Ali = this.add.existing(new Alien(this,200,450,1));
    
   
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
        frameRate: 5,
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

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bullet, platforms);
    //this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    //this.physics.add.collider(player, bombs, hitBomb, null, this);

    //this.physics.add.collider(bullet, stars, bulletHitEdge, null, this);

    
    
    
    //this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

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
}

function collectStar (player, star)
{
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

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
function fire() {

        this.bullet.setPosition(this.player.x, this.player.y);
        bullet.setActive(true).setVisible(true);

        this.bullet.setVelocityX(-100);
        this.bullet.setVelocityY(-500);
}

function disappearBullet() {
    bullet.setActive(false).setVisible(false);
}