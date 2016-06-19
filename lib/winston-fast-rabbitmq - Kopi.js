'use strict'

//Set options for RabbitMq
//Implement silent mode
//Implement all winston levels
//uninstall unused modules


const amqplib = require('amqplib');
const amqplibCb = require('amqplib/callback_api');

const util = require('util');

class RabbitMq{
	constructor(options){
		this.amqp = options;
	}

	open(){
		const host = this.amqp.host;

		return new Promise((resolve, reject) => {
			amqplibCb.connect(host, (err, conn) => {
				if(err)
					reject(err);

				resolve(conn);
			});
		});
	}

	createChannel(conn){
		return new Promise((resolve, reject) => {
			conn.createChannel((err, ch) => {
			    if(err)
					reject(err);

				resolve(ch);
			});
		});
	}

	close(conn){
		setTimeout(() => { conn.close(); }, 500);
	}

	send(channel, message){
		const exchangeName = this.amqp.exchangeName;
		const exchangeType = this.amqp.exchangeType;
	    console.log("COMOOOON " + exchangeName + ' ' + exchangeType);
	    return new Promise((resolve, reject) => {
	    	try{
	    		channel.assertExchange(exchangeName, exchangeType, {durable: false});
			    channel.publish(exchangeName, '', new Buffer(message));
			    console.log(" [x] Sent %s", message);
			    resolve();
		    } 
		    catch(ex){
		    	reject(ex);
		    }
	    });
	}
}

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

class WinstonInstantRabbitMq{
	constructor(options){
		console.log(options);

		this.level = options.level || 'info';
		this.applicationId = options.applicationId || 'noname';
		this.handleError = options.handleError || ErrorHelper.defaultError;
		this.silent = options.silent || false;

		this.amqp = {};
		this.amqp.host = options.host || 'amqp://localhost';
		this.amqp.port = options.port || 5672;
		this.amqp.username = options.username || 'guest';
		this.amqp.password = options.password || 'guest';
		this.amqp.virtualHost = options.virtualHost || '';
		this.amqp.exchangeType = options.exchangeType || 'fanout';
		this.amqp.exchangeName = options.exchangeName || 'amq.topic';

		this._wabbit = new RabbitMq(this.amqp);
	}

	log(level, msg, meta, callback){
		let t = this;

		const levelHelper = new LevelHelper();

		if(!levelHelper.isLevelFulfilled(level, t.level))
			return;

		let connection;

		amqplib
			.connect(t.amqp.host)
			.then((conn) => { connection = conn; return conn.createChannel(); })
			.then((channel) => {
				return channel.assertExchange(t.amqp.exchangeName, t.amqp.exchangeType, {durable: false})
					.then((ok) => {
				    	let publish = channel.publish(t.amqp.exchangeName, '', new Buffer(msg));
			    		console.log(" [x] Sent %s", msg);
			    		return publish;
				  	});
			})
			.then(() => { setTimeout(() => { connection.close(); }, 500); })
			.catch(console.warn);









		//  const wabbit = t._wabbit;

		// wabbit
		// 	.open()
		// 	.then((conn) => { connection = conn; })
		// 	.then(() => { return wabbit.createChannel(connection); })
		// 	.then((channel) => { wabbit.send(channel, msg); })
		// 	.then(() => { wabbit.close(connection); })
		// 	.then(callback) 
		// 	.catch((ex) => {
		// 		t.handleError(ex);
		// 	})








		// new Promise((resolve, reject) => {
		// 	amqplibCb.connect(t.amqp.host, (err, conn) => {
		// 		resolve(conn);
		// 	})
		// })
		// .then((conn) => {
		// 	connection = conn;
		// 	//setTimeout(function() { conn.close(); }, 500);
		// 	return new Promise((resolve, reject) => {
		// 		conn.createChannel(function(err, ch) {
		// 	    	resolve(ch);

		// 	    	// amqplibCb.connect(t.amqp.host, function(err, conn) {
		// 	  // conn.createChannel(function(err, ch) {
		// 	  //   msg += '7';

		// 	  //   ch.assertExchange(t.amqp.exchangeName, t.amqp.exchangeType, {durable: false});
		// 	  //   ch.publish(t.amqp.exchangeName, '', new Buffer(msg));
		// 	  //   console.log(" [x] Sent %s", msg);
		// 	  });

		// 	});

			
			
		// })
		// .then((ch) => {
		// 	return new Promise((resolve, reject) => {
		// 	msg += '12';
		// 		ch.assertExchange(t.amqp.exchangeName, t.amqp.exchangeType, {durable: false});
		// 	    ch.publish(t.amqp.exchangeName, '', new Buffer(msg));
		// 	    console.log(" [x] Sent %s", msg);

		// 	    resolve();
		// 	});
		// })
		// .then(() => {
		// 	connection.close(); 
		// });
  

  

		
	}

	//Winston will fail without this
	on(level, callback){}
}

module.exports= WinstonInstantRabbitMq;