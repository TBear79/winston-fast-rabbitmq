//Not quite unit tests as they depend on RabbitMq to be installed

//REQUIREMENTS:
//npm install in test-dir
//RabbitMq installed locally
//Mocha

'use strict'

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const sinon = require('sinon');
const amqplib = require('amqplib');
const winston = require('winston');

const winstonFastRabbitMq = require('../lib/winston-fast-rabbitmq.js');

describe('Levels', (done) => {
	describe('Test if levels are respected', function() {
		it('should return true when minimum level is "info" and level is "info"',  (done) => {
			const wir = new winstonFastRabbitMq();

			const rs = wir._levelHelper.isLevelFulfilled('info', 'info');

			expect(rs).to.be.true;
			done();
		});

		it('should return true when minimum level is "info" and level is "warn"',  (done) => {
			const wir = new winstonFastRabbitMq();

			const rs = wir._levelHelper.isLevelFulfilled('warn', 'info');

			expect(rs).to.be.true;
			done();
		});
		
		it('should return true when minimum level is "info" and level is "error"',  (done) => {
			const wir = new winstonFastRabbitMq();

			const rs = wir._levelHelper.isLevelFulfilled('error', 'info');

			expect(rs).to.be.true;
			done();
		});

		it('should return false when minimum level is "warn" and level is "info"',  (done) => {
			const wir = new winstonFastRabbitMq();

			const rs = wir._levelHelper.isLevelFulfilled('info', 'warn');

			expect(rs).to.be.false;
			done();
		});

		it('should return true when minimum level is "warn" and level is "warn"',  (done) => {
			const wir = new winstonFastRabbitMq();

			const rs = wir._levelHelper.isLevelFulfilled('warn', 'warn');

			expect(rs).to.be.true;
			done();
		});

		it('should return true when minimum level is "error" and level is "warn"',  (done) => {
			const wir = new winstonFastRabbitMq();

			const rs = wir._levelHelper.isLevelFulfilled('warn', 'warn');

			expect(rs).to.be.true;
			done();
		});

		it('should return false when minimum level is "info" and level is "error"',  (done) => {
			const wir = new winstonFastRabbitMq();

			const rs = wir._levelHelper.isLevelFulfilled('info', 'error');

			expect(rs).to.be.false;
			done();
		});

		it('should return false when minimum level is "warn" and level is "error"',  (done) => {
			const wir = new winstonFastRabbitMq();

			const rs = wir._levelHelper.isLevelFulfilled('warn', 'error');

			expect(rs).to.be.false;
			done();
		});

		it('should return true when minimum level is "error" and level is "error"',  (done) => {
			const wir = new winstonFastRabbitMq();

			const rs = wir._levelHelper.isLevelFulfilled('error', 'error');

			expect(rs).to.be.true;
			done();
		});
	});
});

describe('RabbitMq connection', () => {
	describe('Test if messages are emittet to the exchange', function() {
		this.timeout(30000);

		const transportOptions = { 
				protocol: 'amqp',
				username: 'guest',
				password: 'guest',
				host: 'localhost',
				port: 5672,
				silent: true,
				host: 'localhost',
				exchangeName: 'TEST',
				exchangeType: 'topic',
				durable: false
			}

		winston.add(winstonFastRabbitMq, transportOptions);
		winston.remove(winston.transports.Console);
		before(function () { 
		});
		after(function () { 
		});

		it('should return the correct messages from queue',  (done) => {
			transportOptions.level = 'error';
			
			let connection; 
			let connectionCloseTimerId;
			let msgCount = 0;

			setTimeout(() => { winston.error("TESTERROR"); }, 50);

			return amqplib
				 .connect(transportOptions.protocol + '://' + transportOptions.host)
				.then((conn) => { connection = conn; return conn.createChannel(); })
				.then((channel) => {
					return channel.assertExchange(transportOptions.exchangeName, transportOptions.exchangeType, {durable: transportOptions.durable})
						.then((ok) => {
							return channel.assertQueue('', {exclusive: true})
					    				.then((q) => {
					    					channel.bindQueue(q.queue, transportOptions.exchangeName, '');

					    					return channel.consume(q.queue, (msg) => {
					    						
					    						msgCount++;

					    						clearTimeout(connectionCloseTimerId);

										        connectionCloseTimerId = setTimeout(() => { 
										        	const jsonMessage = JSON.parse(msg.content.toString());
										        	expect(jsonMessage.message).to.equal('TESTERROR');
										        	expect(msgCount).to.equal(1);
										        	
										        	connection.close(); 

										        	done();
										        }, 500);

										    }, {noAck: true});
					    				})

					  	});
				})
				.catch((ex) => { throw ex; });

			
			
		});



		it('should send 1000 messages and receive them all',  (done) => {

			const numberOfMessagesToSend = 1000;
			transportOptions.level = 'error';

			let connection; 
			let connectionCloseTimerId;
			let msgCount = 0;

			setTimeout(() => { 
				let i = 0;
				let tmpTimer;

				tmpTimer = setInterval(() => { 
					winston.error("TESTERROR"); 
					i++; 
					if(i >= numberOfMessagesToSend) 
						clearInterval(tmpTimer);
				}, 10);

					
			}, 500);

			return amqplib
				 .connect(transportOptions.protocol + '://' + transportOptions.host)
				.then((conn) => { connection = conn; return conn.createChannel(); })
				.then((channel) => {
					return channel.assertExchange(transportOptions.exchangeName, transportOptions.exchangeType, {durable: transportOptions.durable})
						.then((ok) => {
							return channel.assertQueue('', {exclusive: true})
					    				.then((q) => {
					    					channel.bindQueue(q.queue, transportOptions.exchangeName, '');

					    					return channel.consume(q.queue, (msg) => {
					    						
					    						msgCount++;

					    						clearTimeout(connectionCloseTimerId);

										        connectionCloseTimerId = setTimeout(() => { 
										        	expect(msgCount).to.equal(numberOfMessagesToSend);
										        	
										        	connection.close(); 

										        	done();
										        }, 500);

										    }, {noAck: true});
					    				})

					  	});
				})
				.catch((ex) => { throw ex; });

			
			
		});
	});
});

