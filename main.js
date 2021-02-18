import PlayScene from './scenes/PlayScene.js'
import PhaserWebsocketMultiplayerPlugin from './plugins/PhaserWebsocketMultiplayerPlugin.js'

const config = {
	type: Phaser.AUTO,
	width: 400,
	height: 400,
	backgroundColor: '#000000',
	parent: 'phaser',
	physics: {
		default: 'arcade',
        arcade: {
            debug: false,
            debugShowBody: true,
            debugShowStaticBody: true,
            debugShowVelocity: true,
            debugVelocityColor: 0xffff00,
            debugBodyColor: 0x0000ff,
            debugStaticBodyColor: 0xffffff
         }
	},
	plugins: {
		global: [{
			key: 'websocket-multiplayer',
			plugin: PhaserWebsocketMultiplayerPlugin,
			mapping: 'multiplayer',
			start: true,
			data: {
				url: "wss://us-nyc-1.websocket.me/v3/1?api_key=fy32ZO5g7iDshKjVHm4H4O0LrZfzYx7T6IDK8F9Z&notify_self",				// the url of the websocket
				broadcastInterval: 200,		// the interval in milliseconds in which the state of the tracked object is broadcasted
				pauseTimeout: 5000,			// the time (milliseconds) after which a remote object becomes inactive
				deadTimeout: 15000,			// the time after which a remote object is removed
				checkTimeoutsInterval: 100,	// the interval in milliseconds how oft remote objects are checked
				autoConnect: false,			// if the connection should be established automatically
				debug: false				// if the debug mode is on
			}
		}]
	},
	scene: [PlayScene]
}

let game = new Phaser.Game(config);

export default game;