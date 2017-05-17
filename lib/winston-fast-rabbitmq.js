'use strict'
const winston = require('winston');
const rabbitChatter = require('rabbit-chatter');

class LevelHelper {
    constructor() {
        this.levels = {
            'error': 1,
            'warn': 2,
            'info': 3,
            'verbose': 4,
            'debug': 5,
            'silly': 6
        }
    }

    isLevelFulfilled(level, minimumLevel) {
        const levels = this.levels;

        if (!levels[level])
            return false;

        const levelPriority = levels[level];
        const minimumLevelPriority = levels[minimumLevel];

        return levelPriority <= minimumLevelPriority;
    }
}

class WinstonFastRabbitMq {
    constructor(options) {
        this.name = 'winstonFastRabbitMq';

        if (!options)
            options = {};

        this.level = options.level || 'info';
        this.formatter = options.formatter || function (options) {
            return JSON.stringify({
                level: options.level,
                meta: options.meta,
                message: options.message
            });
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
            timeout: options.timeout || 1000,
            handleError: options.handleError,
        };

        this._rabbit = rabbitChatter.rabbit(rabbitOptions);

        this._levelHelper = new LevelHelper();
    }

    log(level, msg, meta, callback) {
        const t = this;

        if (!t._levelHelper.isLevelFulfilled(level, t.level))
            return;

        const output = {
            level: level,
            message: msg,
            meta: meta,
        }

        msg = t.formatter(output);

        //rabbit chat here
        t._rabbit.chat(msg);

        if (callback)
            callback(null, true);
    }

    //Winston will fail to log exceptions without this
    logException(msg, meta, callback) {
        this.log('error', msg, meta, callback);
    }

    //Winston will fail without this
    on(level, callback) {}
}


module.exports = winston.transports.WinstonFastRabbitMq = WinstonFastRabbitMq;