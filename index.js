const express = require('express')
const pino = require('pino');
const expressPino = require('express-pino-logger');
const e = require('express');

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

app.get('/test-secret', (req, res) => {
    logger.info({headers: req.headers});
    if (req.headers['x-secret'] && req.headers['x-secret'].startsWith('<<<')) {
        console.log('Secret True')
        console.log(req.headers)
        return res.send({success: true})
    }
    return res.status(400).send({success: false});
 });

app.get('/test-header', (req, res) => {
    logger.info({headers: req.headers});
    if (req.headers['x-header-only']){
        console.log('Header Only')
        console.log(req.headers)
        return res.send({success: true})
    } else if (req.headers['x-header-value'] && req.headers['x-header-value'] == '123' ){
        console.log('Header and Value')
        console.log(req.headers)
        return res.send({success: true})
    }
    return res.status(400).send({success: false});
 });

 app.get('/test-multiheader', (req, res) => {
    logger.info({headers: req.headers});
    if (!req.headers['x-header-only']){
        return res.status(400).send({success: false});
    }
    if (!req.headers['x-header-value'] && !req.headers['x-header-value'] == '123' ){
        return res.status(400).send({success: false});
    }
    res.send({success: true})
 });

app.listen(port, () => {
    logger.info('Server running on port %d', port);
})
