'use strict'
const winston = require('winston');
const rabbitChatter = require('rabbit-chatter');

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

class WinstonInstantRabbitMq{
	constructor(options){
		this.name = 'winstonFastRabbitMq';

		if(!options)
			options = {};

		this.level = options.level || 'info';
        this.formatter = options.formatter || function(level, meta, message)
        {
            return JSON.stringify({ level: level, meta: meta, message: message  });
        };
				
		const rabbitOptions = {
			appId: options.appId || options.applicationId,
			silent: options.silent,
			exchangeType: options.exchangeType,
			exchangeName: options.exchangeName || 'winston-log',
			durable: options.durable,
			protocol: options.protocol || 'amqp',
			username: options.username || 'guest',
			password: options.password || 'guest',
			host: options.host || 'localhost',
			virtualHost: options.virtualHost ? options.virtualHost : '',
			port: options.port || 5672,
			routingKey: options.routingKey || '',
			handleError: options.handleError
		};
		
		this._rabbit = rabbitChatter.rabbit(rabbitOptions);

		this._levelHelper = new LevelHelper();
	}

	log(level, msg, meta, callback){
		let t = this;

		const levelHelper = new LevelHelper();

		if(!t._levelHelper.isLevelFulfilled(level, t.level))
			return;

		msg = t.formatter(level, meta, msg);

		//rabbit chat here
		t._rabbit.chat(msg);
	}

	//Winston will fail without this
	on(level, callback){}
}


module.exports= winston.transports.WinstonInstantRabbitMq = WinstonInstantRabbitMq;
