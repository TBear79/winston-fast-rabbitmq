# winston-fast-rabbitmq

A RabbitMQ transport for Winston. It closes the connection after every message, but keeps the connection open as long as new messages arrive within a short timespan.

* Very few dependencies
* Easy to use and fast to implement
* Stable even when submitting several messages in a short timespan.
* Build on [amqplib](https://www.npmjs.com/package/amqplib)

# Usage

Use [npm](https://www.npmjs.com/) to install the module:

```
	npm install winston-fast-rabbitmq
```

Then use `require()` to load it in your code:

```javascript
	var winstonFastRabbitMq = require('winston-fast-rabbitmq');
```

Setup the transport in winston:

```javascript
	winston.add(winstonFastRabbitMq, options);
```

That's it! Of course you need to have RabbitMQ up and running for this to work.

If you haven't, I'll just provide a link to their homepage as a service: [RabbitMQ](https://www.rabbitmq.com/).

## Options

You can of course provide options for setting up the transport and AMQP.


### level

String

Default: 'info'.

Sets the minimum required level for sending the log to RabbitMQ. You can find the levels [here](https://www.npmjs.com/package/winston#logging-levels).


### applicationId

String

Default: ''.

A name for the application sends the message. Used in the receiving application to identify where the message came from.


### handleError

Function

Default: See below.

A function for handling errors if it fails when sending the log to the queue.

The default function looks like this:
```javascript
	(ex) => {
		console.log('ERROR in winston-fast-rabbitmq: ' + util.inspect(ex, { depth: null }));
	}
```


### silent

boolean

Default: false.

If true, console-messages from winston-fast-rabbitmq will be suppressed. 

Bonus info! If you whan to suppress console messages from winston, just do this:

```javascript
	winston.remove(winston.transports.Console);
```


### wrapMessage

boolean

Default: true.

If true, messages will be wrapped in JSON where date and time is added using the toISOString() of the Date object.
The resulting object will look something like this: 

```javascript
	{"applicationId":"MyApp","datetime":"2016-06-19T13:06:14.451Z","level":"info","message":"We're testing the module!"}
```

### protocol

string

Default: 'amqp'

The protocol used to communicate with RabbitMQ (or perhaps another message queue?)


### host

string

Default: 'localhost'

The URI of the server that hosts the RabbitMQ.


### virtualHost

string

Default: ''

Used if RabbitMQ is configured with a virtual host on the server.


### port

number

Default: 5672

The port that is open for connections to RabbitMQ.

### username

string

Default: 'guest'

Use this if RabbitMQ if credentials is required.


### password

string

Default: 'guest'

Use this if RabbitMQ if credentials is required.


### exchangeType

string

Default: 'topic'

The topic for the exchange.


### exchangeName

string

Default: 'winstonLog'

The name for the exchange.


# Tests

To run tests on this module, make sure that the modules for the tests are installed

```
	npm install winston-fast-rabbitmq --dev
```

Then run:

```
	npm test
```

NOTICE: The test is not only a unit test but also a functionality test. So rabbitMQ is required to be installed locally in order to run the test.

In one of the tests, 1000 messages are send to the queue. It runs in about 12 seconds so don't be nervous if it seems to stall for a while.


#Futher reading

Further documentation the topics according to this module:

* [Winston](https://www.npmjs.com/package/winston)
* [RabbitMQ](https://www.rabbitmq.com/documentation.html) [Tutorial](https://www.rabbitmq.com/getstarted.html)
* [amqplib](https://www.npmjs.com/package/amqplib)

#Keywords
winston, rabbitmq, amqp, amqplib, logging, winston transport

# License

The MIT License (MIT)

Copyright (c) 2016 Thorbjørn Gliese Jelgren (The Right Foot)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

