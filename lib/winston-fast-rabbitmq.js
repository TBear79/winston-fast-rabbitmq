'use strict'

//Set options for RabbitMq
//Implement silent mode
//Implement all winston levels
//uninstall unused modules


const amqplib = require('amqplib');
const util = require('util');

class LevelHelper{
	constructor(){
		this.levels = {
			'info': 1,
			'warn': 2,
			'error': 3,
		}
	}

	isLevelFulfilled(level, minimumLevel){
		const levels = this.levels;

		if(!levels[level])
			return false;

		const levelPriority = levels[level];
		const minimumLevelPriority = levels[minimumLevel];

		return levelPriority >= minimumLevelPriority;
	}
}

class ErrorHelper{
	static defaultError(ex){
		console.log('ERROR in winston-fast-rabbitmq: ' + util.inspect(ex, { depth: null }));
	}
}

class MessageHelper{
	static wrapMessage(applicationId, timestamp, message){
		return JSON.stringify({ applicationId: applicationId, timestamp: timestamp.toISOString(), message: message  });
	}
}

class WinstonInstantRabbitMq{
	constructor(options){
		this.level = options.level || 'info';
		this.applicationId = options.applicationId || 'noname';
		this.handleError = options.handleError || ErrorHelper.defaultError;
		this.silent = options.silent || false;

		const protocol = options.protocol || 'amqp';
		const username = options.username || 'guest';
		const password = options.password || 'guest';
		const host = options.host || 'localhost';
		const port = options.port || 5672;

		this.amqp = {};
		this.protocol = protocol;
		this.amqp.host = `${protocol}://${username}:${password}@${host}:${port}`;
		this.amqp.virtualHost = options.virtualHost || '';
		this.amqp.exchangeType = options.exchangeType || 'topic';
		this.amqp.exchangeName = options.exchangeName || 'amq.topic';
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

		const wrappedMessage = MessageHelper.wrapMessage(t.applicationId, new Date(), msg);

		t.getConnection()
			.then((channel) => {
				return channel.assertExchange(t.amqp.exchangeName, t.amqp.exchangeType, {durable: t.amqp.durable})
					.then((ok) => {
						let publish = channel.publish(t.amqp.exchangeName, t.amqp.virtualHost, new Buffer(wrappedMessage));

						if(!t.silent) console.log("Message send from winston-fast-rabbit: %s", wrappedMessage);
			    		
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