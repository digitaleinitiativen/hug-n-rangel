export default class PlayScene extends Phaser.Scene {
	constructor() {
		super('play');

		this.me = null;
		this.cursors = null;

		this.D_ACCELERATION = 400;
		this.D_MAXSPEED = 400;
		this.D_DRAG = 500;
	}

	create() {
		this.me = this.makeMe(this.createKorpus(200, 200, 0xff0000));

		let theOtherGuy = this.createKorpus(100, 100, 0x00ff00);
		let theOtherOtherGuy = this.createKorpus(300, 300, 0x0000ff);

		this.cursors = this.input.keyboard.createCursorKeys();
	}

	update() {
		if(this.cursors.up.isDown) this.me.body.setAccelerationY(-this.D_ACCELERATION);
		else if(this.cursors.down.isDown) this.me.body.setAccelerationY(this.D_ACCELERATION);
		else this.me.body.setAccelerationY(0);

		if(this.cursors.left.isDown) this.me.body.setAccelerationX(-this.D_ACCELERATION);
		else if(this.cursors.right.isDown) this.me.body.setAccelerationX(this.D_ACCELERATION);
		else this.me.body.setAccelerationX(0);
	}

	createKorpus(x, y, color, love = 1, rage = 0) {
		let c = this.add.graphics({ x: x, y:y });

		this.paintKorpus(c, color, love, rage);

		this.physics.add.existing(c);

		this.input.enableDebug(c);

		c.body.setCircle(12, -12);


		return c;
	}

	paintKorpus(c, color, love, rage) {
		c.clear();
		c.fillStyle(color);

		c.beginPath();
		c.arc(0, 0, 12, 0, Math.PI * 2);
		c.closePath();
		c.fill();
	}

	makeMe(c) {
		c.body.collideWorldBounds = true;
		c.body.setMaxSpeed(this.D_MAXSPEED);
		c.body.setDrag(this.D_DRAG, this.D_DRAG);
		return c;
	}
}
