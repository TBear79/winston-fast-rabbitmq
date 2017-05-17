import * as winston from 'winston';

declare class WinstonFastRabbitMq extends winston.Transport {
    constructor(options?: winston.WinstonFastRabbitMqTransportOptions);
    level: string;
    name: string;
}

declare module 'winston' {

    export interface Transports {
        WinstonFastRabbitMq: WinstonFastRabbitMq;
    }

    export interface WinstonFastRabbitMqTransportOptions extends winston.GenericTransportOptions {
        appId?: string;
        durable?: boolean;
        exchangeName?: string;
        exchangeType: string;
        host?: string;
        password?: string;
        port?: number;
        protocol?: string;
        routingKey?: string;
        timeout?: number;
        username?: string;
        virtualHost?: string;
        handleError?(err: any): void;
    }
}
