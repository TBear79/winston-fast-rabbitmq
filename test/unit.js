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
const winston = require('winston');
const util = require('util');
const rabbitChatter = require('rabbit-chatter');

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

