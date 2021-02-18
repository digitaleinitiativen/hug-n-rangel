export default class PlayScene extends Phaser.Scene {
	constructor() {
		super('play');

		this.me = null;
		this.cursors = null;
		this.halos = null;
		this.korpi = null;

		this.D_ACCELERATION = 400;
		this.D_MAXSPEED = 400;
		this.D_DRAG = 500;
		this.D_ACTION_RADIUS = 200;
		this.D_HALO_RADIUS = 200;

		this.keyH = null;
		this.keyR = null;

		this.inAction = false;

		this.hugScore = 0;
		this.hugScoreBox = null;
		this.ranglScore = 0;
		this.ranglScoreBox = null;
	}

	create() {
		this.halos = this.add.graphics();

		this.me = this.makeMe(this.createKorpus(180 * Math.random() + 10, 180 * Math.random() + 10, "0x" + ((1<<24)*Math.random() | 0).toString(16), 1, 1));

		this.korpi = this.add.group();
		let theOtherGuy = this.createKorpus(100, 100, 0x00ff00);
		this.korpi.add(theOtherGuy);

		this.cursors = this.input.keyboard.createCursorKeys();
		this.keyH = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
		this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);


		this.hugScoreBox = this.add.text(15, 15, "(H)ug: 0", {
			color: 'white'
		});
		this.hugScoreBox.setOrigin(0, 0);
		this.ranglScoreBox = this.add.text(15, 30, "(R)angl: 0", {
			color: 'white'
		});
		this.ranglScoreBox.setOrigin(0, 0);

		this.multiplayer.event.on('socket.open', this.initConnection, this);

		this.multiplayer.event.on('object.create', this.createObject, this);
		this.multiplayer.event.on('object.update', this.updateObject, this);
		this.multiplayer.event.on('object.pause', this.pauseObject, this);
		this.multiplayer.event.on('object.kill', this.killObject, this);

		this.multiplayer.track(this.me, this.featureExtractor);

		this.multiplayer.connect();
	}

	initConnection() {
		this.multiplayer.startBroadcast();
	}

	featureExtractor(object) {
		return {
			x: object.x,
			y: object.y,
			color: object.getData('color'),
			love: object.getData('love'),
			rage: object.getData('rage')
		}
	}

	createObject(data, id) {
		let korpus = this.createKorpus(data.x, data.y, data.color, data.love, data.rage);
		this.korpi.add(korpus);

		this.multiplayer.registerObject(id, korpus);
	}

	updateObject(object, data) {
		object.x = data.x;
		object.y = data.y;
		object.setAlpha(1);
	}

	pauseObject(object, id) {
		object.setAlpha(0.1);
	}

	killObject(object, id) {
		object.destroy();
	}

	update() {
		if(this.inAction) return;

		if(this.cursors.up.isDown) this.me.body.setAccelerationY(-this.D_ACCELERATION);
		else if(this.cursors.down.isDown) this.me.body.setAccelerationY(this.D_ACCELERATION);
		else this.me.body.setAccelerationY(0);

		if(this.cursors.left.isDown) this.me.body.setAccelerationX(-this.D_ACCELERATION);
		else if(this.cursors.right.isDown) this.me.body.setAccelerationX(this.D_ACCELERATION);
		else this.me.body.setAccelerationX(0);

		let actionable = false, closest = null, closestDist = 5000;

		for(let i = 0; i < this.korpi.getLength(); i++) {
			let dist = this.me.body.center.distance(this.korpi.getChildren()[i].body.center)
			if(dist <= this.D_ACTION_RADIUS && dist < closestDist) {
				actionable = true;
				closest = this.korpi.getChildren()[i];
				closestDist = dist;
			}
		}

		if(closest && closestDist <= this.D_HALO_RADIUS) {
			this.halo(this.me, closest, closestDist);
		}

		if(actionable) {
			if(Phaser.Input.Keyboard.JustDown(this.keyH))
				this.hug(this.me, closest);
			if(Phaser.Input.Keyboard.JustDown(this.keyR))
				this.rangel(this.me, closest);
		}
	}

	halo(a, b, d) {

		this.halos.clear();
		this.halos
			.fillStyle(0x555555, 1 - d / this.D_HALO_RADIUS)
			.fillCircle(a.body.center.x, a.body.center.y, d/2)
			.fillCircle(b.body.center.x, b.body.center.y, d/2)
		;
	}

	hug(a, b) {
		a.body.stop();
		b.body.stop();

		this.inAction = true;

		var tween = this.tweens.add({
			targets: [a, b],
			x: (a.body.center.x + b.body.center.x) / 2 + Math.random() * 8 - 4,
			y: (a.body.center.y + b.body.center.y) / 2 + Math.random() * 8 - 4,
			ease: 'Power1',
			duration: 500,
			hold: 1000,
			yoyo: true,
			repeat: 0,
			onComplete: function() {
				this.inAction = false;
				a.setData("rage", Math.max(0, a.getData("rage") - 0.2));
				b.setData("rage", Math.max(0, b.getData("rage") - 0.2));
				a.setData("love", Math.min(1, a.getData("love") + 0.2));
				b.setData("love", Math.min(1, b.getData("love") + 0.2));
				this.paintKorpus(a);
				this.paintKorpus(b);

			},
			callbackScope: this
		});

		this.hugScore = this.hugScore + 1;
		this.hugScoreBox.setText("(H)ug: " + this.hugScore);
	}

	rangel(a, b) {
		a.body.stop();
		b.body.stop();

		this.inAction = true;

		var tween = this.tweens.add({
			targets: [a, b],
			x: (a.body.center.x + b.body.center.x) / 2 + Math.random() * 8 - 4,
			y: (a.body.center.y + b.body.center.y) / 2 + Math.random() * 8 - 4,
			ease: 'Power1',
			duration: 100,
			hold: 0,
			yoyo: true,
			repeat: 6,
			onComplete: function() {
				this.inAction = false;
				a.setData("love", Math.max(0, a.getData("love") - 0.2));
				b.setData("love", Math.max(0, b.getData("love") - 0.2));
				a.setData("rage", Math.min(1, a.getData("rage") + 0.2));
				b.setData("rage", Math.min(1, b.getData("rage") + 0.2));
				this.paintKorpus(a);
				this.paintKorpus(b);
			},
			callbackScope: this
		});

		this.ranglScore = this.ranglScore + 1;
		this.ranglScoreBox.setText("(R)angl: " + this.ranglScore);
	}

	createKorpus(x, y, color, love = 1, rage = 0) {
		let c = this.add.graphics({ x: x, y:y });

		this.paintKorpus(c, color, love, rage);

		this.physics.add.existing(c);
		c.body.setCircle(12, -12, -12);

		this.input.enableDebug(c);

		c.setData('love', love);
		c.setData('rage', rage)
		c.setData('color', color);

		return c;
	}

	paintKorpus(c, color = null, love = null, rage = null) {

		if(color == null) color = c.getData('color');
		if(love == null) love = c.getData('love');
		if(rage == null) rage = c.getData('rage');

		console.log(c.getData("color"));

		c.clear();
		c.fillStyle(color);

		// horns
		let r1 = 11, r2 = Math.round(r1 + 3 + 10 * rage), 
			aP = -Math.PI / 4, aD = Math.PI / 6;
		c.fillTriangle(
			r1 * Math.cos(aP + aD), r1 * Math.sin(aP + aD), 
			r1 * Math.cos(aP - aD), r1 * Math.sin(aP - aD),
			r2 * Math.cos(aP), 		r2 * Math.sin(aP)
		);
		aP = -Math.PI - aP;
		c.fillTriangle(
			r1 * Math.cos(aP + aD), r1 * Math.sin(aP + aD), 
			r1 * Math.cos(aP - aD), r1 * Math.sin(aP - aD),
			r2 * Math.cos(aP), r2 * Math.sin(aP)
		);

		// body
		c.beginPath();
		c.arc(0, 0, 12, 0, Math.PI * 2);
		c.closePath();
		c.fill();

		// heart
		c.fillStyle(0xffffff, 0.2 + 0.8 * love);
		c.fillCircle(-4, -3, 4);
		c.fillCircle(4, -3, 4);
		c.fillTriangle(-9, -2, 9, -2, 0, 9);
	}

	makeMe(c) {
		c.body.collideWorldBounds = true;
		c.body.setMaxSpeed(this.D_MAXSPEED);
		c.body.setDrag(this.D_DRAG, this.D_DRAG);
		return c;
	}
}
