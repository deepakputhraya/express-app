const express = require('express')
const pino = require('pino');
const expressPino = require('express-pino-logger');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });
const app = express()
const port = process.env.PORT || 3000

app.use(expressLogger);

app.get('/ping', (req, res) => {
    res.send({
        message : "pong!"
    })
})

app.get('/headers', (req, res) => {
    logger.info({headers: req.headers});
    res.send({
        headers : req.headers
    })
})

app.get('/auth', (req, res) => {
   logger.info({headers: req.headers});
   if (!req.headers['x-api-key']) {
       return res.status(400).send({success: false});
   }
   res.send({success: true})
});

app.listen(port, () => {
    logger.info('Server running on port %d', port);
})
