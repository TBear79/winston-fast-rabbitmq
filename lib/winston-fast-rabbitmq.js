'use strict'

const amqplib = require('amqplib');
const util = require('util');

class LevelHelper{
	constructor(){
		this.levels = {
			'error': 1,
			'warn': 2,
			'info': 3,
			'verbose': 4,
			'debug': 5,
			'silly': 6
		}
	}

	isLevelFulfilled(level, minimumLevel){
		const levels = this.levels;

		if(!levels[level])
			return false;

		const levelPriority = levels[level];
		const minimumLevelPriority = levels[minimumLevel];

		return levelPriority <= minimumLevelPriority;
	}
}

class ErrorHelper{
	static defaultError(ex){
		console.log('ERROR in winston-fast-rabbitmq: ' + util.inspect(ex, { depth: null }));
	}
}

class MessageHelper{
	static wrapMessage(appId, datetime, level, message){
		return JSON.stringify({ appId: appId, datetime: datetime.toISOString(), level: level, message: message  });
	}
}

class WinstonInstantRabbitMq{
	constructor(options){

		if(!options)
			options = {};

		this.level = options.level || 'info';
		this.appId = options.appId || options.applicationId || '';
		this.handleError = options.handleError || ErrorHelper.defaultError;
		this.silent = options.silent || false;
		this.wrapMessage = options.wrapMessage || true;

		const protocol = options.protocol || 'amqp';
		const username = options.username || 'guest';
		const password = options.password || 'guest';
		const host = options.host || 'localhost';
		const virtualHost = options.virtualHost ? '/%2F' + options.virtualHost : '';
		const port = options.port || 5672;

		this.amqp = {};
		this.protocol = protocol;
		this.amqp.host = `${protocol}://${username}:${password}@${host}${virtualHost}:${port}`;
		
		this.amqp.exchangeType = options.exchangeType || 'topic';
		this.amqp.exchangeName = options.exchangeName || 'winstonLog';
		this.amqp.durable = options.durable || false;

		this._levelHelper = new LevelHelper();
		this._connection = null;
		this._connectionTimer = null;
	}

	log(level, msg, meta, callback){
		let t = this;

		const levelHelper = new LevelHelper();

		if(!t._levelHelper.isLevelFulfilled(level, t.level))
			return;

		if(t.wrapMessage)
			msg = MessageHelper.wrapMessage(t.appId, new Date(), level, msg);

		t.getConnection()
			.then((channel) => {
				return channel.assertExchange(t.amqp.exchangeName, t.amqp.exchangeType, {durable: t.amqp.durable})
					.then((ok) => {
						let publish = channel.publish(t.amqp.exchangeName, '', new Buffer(msg));

						if(!t.silent) console.log("Message send from winston-fast-rabbit: %s", msg);
			    		
			    		return publish;
				  	});
			})
			.then(() => { 
				clearTimeout(t._connectionTimer);
				t._connectionTimer = setTimeout(() => { t._connection.close(); t._connection = null; }, 500); 
				callback(); 
			})
			.catch(t.handleError);
	}

	getConnection(){
		const t = this;

		if(t._connection){
			return new Promise((resolve, reject) => { resolve(t._connection.createChannel()); });
		}
		else{
			return amqplib
				.connect(t.amqp.host)
				.then((conn) => { t._connection = conn; return t._connection.createChannel(); });
		}
	}

	//Winston will fail without this
	on(level, callback){}
}

module.exports= WinstonInstantRabbitMq;