'use strict'

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const sinon = require('sinon');
const amqplib = require('amqplib');
const winston = require('winston');

const winstonFastRabbitMq = require('../lib/winston-fast-rabbitmq.js');

describe('Winston connection', () => {
	describe('Test if log is send to RabbitMQ', function() {
		this.timeout(30000);
		
		const transportOptions = { 
				protocol: 'amqp',
				username: 'guest',
				password: 'guest',
				host: 'localhost',
				port: 5672,
				silent: true,
				exchangeName: 'TEST',
				exchangeType: 'topic',
				durable: false
			}

		winston.add(winstonFastRabbitMq, transportOptions);
		winston.remove(winston.transports.Console);

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
	});
});