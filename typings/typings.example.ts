import * as winston from 'winston';
import 'winston-fast-rabbitmq';

const logger = new winston.Logger();
const options: winston.WinstonFastRabbitMqTransportOptions = {
    appId: '',
    durable: false,
    exceptionsLevel: 'error',
    exchangeName: 'winston-log',
    exchangeType: 'topic',
    handleError: (err: any) => void(0),
    handleExceptions: true,
    host: 'localhost',
    humanReadableUnhandledException: true,
    level: 'debug',
    password: 'guest',
    port: 5672,
    protocol: 'amqp',
    raw: false,
    routingKey: 'log.*',
    silent: true,
    username: 'guest',
    virtualHost: '%2f',
};
logger.add(winston.transports.WinstonFastRabbitMq, options);
